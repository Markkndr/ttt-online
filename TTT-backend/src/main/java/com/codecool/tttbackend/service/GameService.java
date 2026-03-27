package com.codecool.tttbackend.service;

import com.codecool.tttbackend.controller.dto.request.CreateGameRequestDTO;
import com.codecool.tttbackend.controller.dto.response.GameResponseDTO;
import com.codecool.tttbackend.controller.dto.response.GameStatusResponseDTO;
import com.codecool.tttbackend.controller.dto.response.PlayerResponseDTO;
import com.codecool.tttbackend.dao.model.User;
import com.codecool.tttbackend.dao.model.game.Game;
import com.codecool.tttbackend.dao.model.game.GameState;
import com.codecool.tttbackend.dao.model.game.Move;
import com.codecool.tttbackend.dao.model.game.Player;
import com.codecool.tttbackend.dao.model.game.Position;
import com.codecool.tttbackend.dao.GameRepository;
import com.codecool.tttbackend.dao.PlayerRepository;
import com.codecool.tttbackend.domain.game.GameLogic;
import com.codecool.tttbackend.domain.game.board.BigBoard;
import org.springframework.beans.factory.annotation.Autowired;
import com.codecool.tttbackend.domain.game.board.BigBoard;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GameService {

   private final GameRepository gameRepository;
   private final PlayerRepository playerRepository;
   private final UserService userService;

   public GameService(GameRepository gameRepository,
                      PlayerRepository playerRepository,
                      UserService userService) {
      this.gameRepository = gameRepository;
      this.playerRepository = playerRepository;
      this.userService = userService;
   }

   public int createGame(CreateGameRequestDTO createGameRequestDTO) {
      User creator = userService.getUserByUserName(createGameRequestDTO.userName());
      if (creator == null) {
         throw new IllegalArgumentException("User not found: " + createGameRequestDTO.userName());
      }

      Player creatorPlayer = new Player();
      creatorPlayer.setUser(creator);
      creatorPlayer.setCharacter(createGameRequestDTO.character());

      Game game = new Game();
      game.setCreator(creator);
      game.setName(createGameRequestDTO.gameName());
      game.setMaxPlayers(createGameRequestDTO.maxPlayerCount());
      game.setTimeCreated(LocalDateTime.now());
      game.setGameState(GameState.WAITING);

      updateBoardFields(game, new BigBoard());
      game.addPlayer(creatorPlayer);

      Game savedGame = gameRepository.save(game);
      return savedGame.getId();
   }

   public void startGame(int id) {
      Game game = getGameOrThrow(id);
      hydrateBoard(game);

      game.setGameState(GameState.IN_PROGRESS);
      if (game.getCurrentPlayer() == null && !game.getPlayers().isEmpty()) {
         game.setCurrentPlayer(game.getPlayers().getFirst());
      }

      List<Player> players = game.getPlayers();
      game.setCurrentPlayer(players.getFirst());

      syncPersistenceFieldsFromRuntimeState(game);
      gameRepository.save(game);
   }

   public void endGame(int id) {
      Game game = getGameOrThrow(id);
      hydrateBoard(game);

      game.setGameState(GameState.ENDED);
      syncPersistenceFieldsFromRuntimeState(game);
      gameRepository.save(game);
   }

   public void joinGame(int id, String userName, char character) {
      Game game = getGameOrThrow(id);

      User user = userService.getUserByUserName(userName);
      if (user == null) {
         throw new IllegalArgumentException("User not found: " + userName);
      }

      boolean alreadyJoined = game.getPlayers().stream()
          .anyMatch(player -> player.getUser().getId().equals(user.getId()));

      if (alreadyJoined) {
         return;
      }

      Player player = new Player();
      player.setUser(user);
      player.setCharacter(character);

      game.addPlayer(player);
      gameRepository.save(game);
   }

   public void leaveGame(int id, String userName) {
      Game game = getGameOrThrow(id);

      User user = userService.getUserByUserName(userName);
      if (user == null) {
         throw new IllegalArgumentException("User not found: " + userName);
      }

      game.getPlayers().removeIf(player -> player.getUser().getId().equals(user.getId()));
      gameRepository.save(game);
   }

   public void winGame(int id, String winnerName) {
      Game game = getGameOrThrow(id);

      User user = userService.getUserByUserName(winnerName);
      Optional<Player> winnerOpt = playerRepository.findByGame_IdAndUser_Id(id, user.getId());
      if (winnerOpt.isEmpty()) {
         throw new IllegalArgumentException("Winning player not found: " + winnerName);
      }

      game.setWinner(winnerOpt.get());
      gameRepository.save(game);
   }

   public void updateGameState(int id, GameState gameState) {
      Game game = getGameOrThrow(id);
      game.setGameState(gameState);
      gameRepository.save(game);
   }

   @Transactional(readOnly = true)
   public List<Game> listAllGames() {
      return gameRepository.findAll();
   }

   public GameStatusResponseDTO makeMove(int gameId, Move move) {
      System.out.println("makeMove service method entered!");
      Game game = getGameOrThrow(gameId);
      hydrateBoard(game);

      System.out.println("game found, state: " + game.getGameState().name());
      if (!GameLogic.validateMove(game, move)) {
         System.out.println("Not a valid move!");
         return null;
      }

      // actually apply the move to the board
      GameLogic.applyMove(game, move);

      // update small-board win counts for players
      GameLogic.setPlayerWins(game);

      // check for a winner (including draw-resolved winner)
      Player winningPlayer = GameLogic.getWinningPlayer(game);
      if (winningPlayer != null) {
         game.setWinner(winningPlayer);
         game.setGameState(GameState.ENDED);
      } else {
         // no winner yet -> advance turn and active board
         GameLogic.setNextCurrentPlayer(game);
         GameLogic.setActiveBoardFromMove(move, game);
      }


      syncPersistenceFieldsFromRuntimeState(game);
      gameRepository.save(game);

      return getGameStatusResponseDTOFromGame(game);
   }

   @Transactional(readOnly = true)
   public Player getPlayer(int gameId, String userName) {
      User user = userService.getUserByUserName(userName);
      if (user == null) {
         throw new IllegalArgumentException("User not found: " + userName);
      }

      return playerRepository.findByGame_IdAndUser_Id(gameId, user.getId()).orElse(null);
   }

   @Transactional(readOnly = true)
   public List<GameResponseDTO> getUserGameResponseDTOs(String username) {
      User user = userService.getUserByUserName(username);
      if (user == null) {
         return new ArrayList<>();
      }

      return gameRepository.findAllGamesByUserId(user.getId())
          .stream()
          .filter(game -> !game.getGameState().equals(GameState.ENDED))
          .map(this::getGameResponseDTOFromGame)
          .toList();
   }

   @Transactional(readOnly = true)
   public List<GameResponseDTO> getAvailableGameResponseDTOs(String userName) {
      User user = userService.getUserByUserName(userName);
      if (user == null) {
         return new ArrayList<>();
      }

      return gameRepository.findByGameState(GameState.WAITING)
          .stream()
          .filter(game -> !game.getCreator().getId().equals(user.getId()))
          .filter(game -> game.getPlayers().stream()
              .noneMatch(player -> player.getUser().getId().equals(user.getId())))
          .filter(game -> game.getMaxPlayers() > game.getPlayers().size())
          .map(this::getGameResponseDTOFromGame)
          .toList();
   }

   @Transactional(readOnly = true)
   public List<GameResponseDTO> getActiveGameResponseDTOs(String userName) {
      User user = userService.getUserByUserName(userName);
      if (user == null) {
         return new ArrayList<>();
      }

      return gameRepository.findAllGamesByUserId(user.getId())
          .stream()
          .filter(game -> game.getGameState() == GameState.IN_PROGRESS)
          .map(this::getGameResponseDTOFromGame)
          .toList();
   }

   @Transactional(readOnly = true)
   public List<GameResponseDTO> getJoinedGameResponseDTOs(String userName) {
      User user = userService.getUserByUserName(userName);
      if (user == null) {
         return new ArrayList<>();
      }

      return gameRepository.findAllGamesByUserId(user.getId())
          .stream()
          .filter(game -> !game.getCreator().getId().equals(user.getId()))
          .map(this::getGameResponseDTOFromGame)
          .toList();
   }

   @Transactional(readOnly = true)
   public List<GameResponseDTO> getUser(String userName) {
      User user = userService.getUserByUserName(userName);
      if (user == null) {
         return new ArrayList<>();
      }

      return gameRepository.findAllGamesByUserId(user.getId())
          .stream()
          .filter(game -> game.getGameState() == GameState.IN_PROGRESS)
          .map(this::getGameResponseDTOFromGame)
          .toList();
   }

   @Transactional(readOnly = true)
   public GameStatusResponseDTO getGameStatus(int id) {
      Game game = getGameOrThrow(id);
      hydrateBoard(game);
      return getGameStatusResponseDTOFromGame(game);
   }

   @Transactional(readOnly = true)
   public int countWinsByUserId(int userId) {
      return (int) gameRepository.countByWinner_Id(userId);
   }

   @Transactional(readOnly = true)
   public int countTotalGamesByUserId(int userId) {
      return (int) playerRepository.countByUser_Id(userId);
   }

   private Game getGameOrThrow(int id) {
      return gameRepository.findById(id)
          .orElseThrow(() -> new IllegalArgumentException("Game not found: " + id));
   }

   private void hydrateBoard(Game game) {
      if (game.getBoardState() == null || game.getBoardState().isBlank()) {
         game.setBoard(new BigBoard());
         return;
      }

      Position activePosition = game.getActiveBoard() == null
          ? null
          : Position.positionFromString(game.getActiveBoard());

      game.setBoard(BigBoard.createBigBoard(game.getBoardState(), activePosition));
   }

   private void syncPersistenceFieldsFromRuntimeState(Game game) {
      if (game.getBoard() != null) {
         game.setBoardState(game.getBoard().toString());

         Position activePosition = getActiveBoardPosition(game.getBoard());
         game.setActiveBoard(activePosition == null ? null : activePosition.toString());
      }

      Player currentPlayer = game.getCurrentPlayerAsPlayer();
      game.setCurrentPlayer(currentPlayer);

      Player winner = GameLogic.getWinningPlayer(game);
      game.setWinner(winner);
   }

   private void updateBoardFields(Game game, BigBoard board) {
      game.setBoard(board);
      game.setBoardState(board == null ? null : board.toString());

      Position activePosition = getActiveBoardPosition(board);
      game.setActiveBoard(activePosition == null ? null : activePosition.toString());
   }

   private Position getActiveBoardPosition(BigBoard bigBoard) {
      if (bigBoard == null) {
         return null;
      }

      List<Position> activeBoardPositions = bigBoard.getActiveBoardPositions();
      if (activeBoardPositions == null || activeBoardPositions.size() != 1) {
         return null;
      }

      return activeBoardPositions.get(0);
   }

   private GameStatusResponseDTO getGameStatusResponseDTOFromGame(Game game) {
      GameLogic.setPlayerWins(game);
      boolean started = game != null && game.getGameState() == GameState.IN_PROGRESS;

      Player currentPlayer = game.getCurrentPlayerAsPlayer();
      Player winner = GameLogic.getWinningPlayer(game);

        return new GameStatusResponseDTO(
                getPlayerResponseDTOFromPlayer(currentPlayer),
                game.getBoard().toSmallBoardsStrings(),
                game.getBoard().toBigBoardStrings(),
                getActiveBoardsFromGame(game),
                getPlayerResponseDTOFromPlayer(winner),
                game.getRotation(),
                started
        );
    }

   private PlayerResponseDTO getPlayerResponseDTOFromPlayer(Player player) {
        if (player == null) {
            return null;
        }

      return new PlayerResponseDTO(
          player.getUser().getId(),
          player.getUser().getUsername(),
          player.getCharacter(),
          player.getNumberOfWins(),
          0,
              player.getUser().getProfileImage()
      );
   }

    private List<String> getActiveBoardsFromGame(Game game) {
        return game.getBoard()
                .getActiveBoardPositions()
                .stream()
                .map(Position::toString)
                .toList();
    }

    private GameResponseDTO getGameResponseDTOFromGame(Game game) {
        return new GameResponseDTO(
                game.getId(),
                game.getGameState().name(),
                game.getName(),
                game.getCreator().getUsername(),
                "public",
                game.getMaxPlayers(),
                game.getPlayers().size(),
                game.getPlayers().stream().map(Player::getCharacter).toList()
        );
    }
}