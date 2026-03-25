package com.codecool.tttbackend.controller;

import com.codecool.tttbackend.controller.dto.request.*;
import com.codecool.tttbackend.controller.dto.response.GameIdResponseDTO;
import com.codecool.tttbackend.controller.dto.response.GameResponseDTO;
import com.codecool.tttbackend.controller.dto.response.GameStatusResponseDTO;
import com.codecool.tttbackend.dao.model.game.Move;
import com.codecool.tttbackend.dao.model.game.Position;
import com.codecool.tttbackend.service.GameService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

   private final GameService gameService;
   private final SimpMessagingTemplate messagingTemplate;
   private static final Logger LOG = LoggerFactory.getLogger(GameController.class);

   public GameController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
      this.gameService = gameService;
      this.messagingTemplate = messagingTemplate;
   }

   @PostMapping("/create")
   public ResponseEntity<GameIdResponseDTO> createGame(@RequestBody CreateGameRequestDTO createGameRequestDTO) {
      int gameId = gameService.createGame(createGameRequestDTO);
      return ResponseEntity.ok(new GameIdResponseDTO(gameId));
   }

   @GetMapping("/mine")
   public ResponseEntity<List<GameResponseDTO>> getMyGames(Principal principal) {
      String userName = (principal != null) ? principal.getName() : null;

      if (userName == null || userName.isBlank()) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      LOG.info("Incoming query for games created by {}", userName);
      List<GameResponseDTO> gameResponseDTOS = gameService.getUserGameResponseDTOs(userName);
      LOG.info("Number of user's created games found: {}", gameResponseDTOS.size());
      return ResponseEntity.ok(gameResponseDTOS);
   }

   @GetMapping("/available")
   public ResponseEntity<List<GameResponseDTO>> getAvailableGames(Principal principal) {
      String userName = (principal != null) ? principal.getName() : null;

      if (userName == null || userName.isBlank()) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      LOG.info("Incoming query for all avaliable games of {}", userName);
      List<GameResponseDTO> gameResponseDTOS = gameService.getAvailableGameResponseDTOs(userName);
      LOG.info("Number of available games found: {}", gameResponseDTOS.size());
      return ResponseEntity.ok(gameResponseDTOS);
   }


   @GetMapping("/active")
   public ResponseEntity<List<GameResponseDTO>> getActiveGames(Principal principal){
      String userName = (principal != null) ? principal.getName() : null;

      if (userName == null || userName.isBlank()) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      LOG.info("Incoming query for all active games of {}", userName);
      List<GameResponseDTO> gameResponseDTOS = gameService.getActiveGameResponseDTOs(userName);
      LOG.info("Number of active games found: {}", gameResponseDTOS.size());
      return ResponseEntity.ok(gameResponseDTOS);
   }

   @GetMapping("/joined")
   public ResponseEntity<List<GameResponseDTO>> getJoinedGames(Principal principal){
      String userName = (principal != null) ? principal.getName() : null;

      if (userName == null || userName.isBlank()) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      LOG.info("Incoming query for all joined games of {}", userName);
      List<GameResponseDTO> gameResponseDTOS = gameService.getJoinedGameResponseDTOs(userName);
      LOG.info("Number of joined games found: {}", gameResponseDTOS.size());
      return ResponseEntity.ok(gameResponseDTOS);
   }

   @PatchMapping("/{gameId}/join")
   public ResponseEntity<Void> joinGame(@PathVariable int gameId, @RequestBody JoinGameRequestDTO joinGameRequestDTO, Principal principal) {
      String userName = (principal != null) ? principal.getName() : null;

      if (userName == null || userName.isBlank()) {
         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      gameService.joinGame(gameId, userName, joinGameRequestDTO.character());

      // TODO: broadcast notifications to players
      messagingTemplate.convertAndSend("/topic/games/" + gameId, gameService.getGameStatus(gameId));

      return ResponseEntity.ok().build();
   }

   @PatchMapping("/{gameId}/leave")
   public ResponseEntity<Void> leaveGame(@PathVariable int gameId, @RequestBody LeaveGameRequestDTO leaveGameRequestDTO) {
      gameService.leaveGame(gameId, leaveGameRequestDTO.userName());
      return ResponseEntity.ok().build();
   }

   @PatchMapping("/{gameId}/start")
   public ResponseEntity<Void> startGame(@PathVariable int gameId) {
      gameService.startGame(gameId);
      messagingTemplate.convertAndSend("/topic/games/" + gameId, gameService.getGameStatus(gameId));
      return ResponseEntity.ok().build();
   }

   @GetMapping("/{gameId}")
   public ResponseEntity<GameStatusResponseDTO> getGameStatus(@PathVariable int gameId) {
      return ResponseEntity.ok(gameService.getGameStatus(gameId));
   }

   @PatchMapping("/{gameId}/end")
   public ResponseEntity<Void> endGame(@PathVariable int gameId) {
      gameService.endGame(gameId);
      return ResponseEntity.ok().build();
   }

   // STOMP message handler: use @Payload and void return type so STOMP message conversion is used correctly
   @MessageMapping("/{gameId}/move")
   public void makeMove(@DestinationVariable int gameId, @Payload MoveRequestDTO moveRequestDTO) {
      LOG.info("Incoming move request to game #{} payload: {}", gameId, moveRequestDTO);
      GameStatusResponseDTO response = gameService.makeMove(gameId, new Move(gameService.getPlayer(gameId, moveRequestDTO.userName()), new Position(moveRequestDTO.br(), moveRequestDTO.bc()), new Position(moveRequestDTO.sr(), moveRequestDTO.sc())));

      if (response == null) {
         LOG.info("Move rejected by server for game #{} and player {}", gameId, moveRequestDTO.userName());
         return;
      }
      LOG.info("About to send update to /topic/games/{} : {}", gameId, response);
      messagingTemplate.convertAndSend("/topic/games/" + gameId, response);
      LOG.info("Move made! (sent)");
   }

   // Temporary test endpoint to broadcast the current game status to subscribed clients
   @GetMapping("/{gameId}/test-broadcast")
   public ResponseEntity<Void> testBroadcast(@PathVariable int gameId) {
      messagingTemplate.convertAndSend("/topic/games/" + gameId, gameService.getGameStatus(gameId));
      LOG.info("Test broadcast sent for game {}", gameId);
      return ResponseEntity.ok().build();
   }

   @PatchMapping("/{gameId}/win")
   public ResponseEntity<Void> winGame(@PathVariable int gameId, @RequestBody WinGameRequestDTO winGameRequestDTO) {
      gameService.winGame(gameId, winGameRequestDTO.winnerName());
      gameService.endGame(gameId);
      return ResponseEntity.ok().build();
   }

}
