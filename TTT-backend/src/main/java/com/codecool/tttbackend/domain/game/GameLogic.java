package com.codecool.tttbackend.domain.game;

import com.codecool.tttbackend.dao.model.game.Game;
import com.codecool.tttbackend.dao.model.game.Move;
import com.codecool.tttbackend.dao.model.game.Player;
import com.codecool.tttbackend.dao.model.game.Position;

import java.util.Comparator;
import java.util.List;

public class GameLogic {

   public static boolean validateMove(Game game, Move move) {
      boolean condition1 = game.getBoard().getCell(move.bigPosition().getRow(), move.bigPosition().getColumn(), move.smallPosition().getRow(), move.smallPosition().getColumn()) == '_';
      if (!condition1) System.out.println("Cell is not empty!");

      boolean condition2 = game.getCurrentPlayer().getUser().getUsername().equals(move.player().getUser().getUsername());
      if (!condition2) System.out.println("Player " + move.player().getUser().getUsername() + " is not the currentPlayer!\ncurrentPlayer: " + game.getCurrentPlayer().getUser().getUsername());
      System.out.println("move.bigPosition() = " + move.bigPosition() + " class=" + move.bigPosition().getClass().getName()); List<Position> active = game.getBoard().getActiveBoardPositions(); System.out.println("active list: " + active); active.forEach(p -> System.out.println(" item: " + p + " class=" + p.getClass().getName() + " hash=" + p.hashCode())); System.out.println("contains? " + active.contains(move.bigPosition())); System.out.println("equals checks:"); active.forEach(p -> System.out.println(" equals(" + p + ") -> " + p.equals(move.bigPosition())));

      boolean condition3 = game.getBoard().getActiveBoardPositions().contains(move.bigPosition());
      if (!condition3) System.out.println("Board is not active: (" + move.bigPosition() + ")\nActive boards: \n" + game.getBoard().getActiveBoardPositions().toString());

      return condition1 && condition2 && condition3;
   }

   public static void applyMove(Game game, Move move) {
      game.getBoard().makeMove(
              move.player().getCharacter(),
              move.bigPosition(),
              move.smallPosition()
      );
   }

   public static Player getWinningPlayer(Game game) {
      Character winningCharacter = game.getBoard().getWinningCharacter();

      if (winningCharacter == null) {
         return null;
      }

      if (winningCharacter == 'D') {
         return game.getPlayers()
                 .stream()
                 .max(Comparator.comparing(
                         player -> game.getBoard().getNumberOfSmallWinsByChar(player.getCharacter())
                 ))
                 .orElse(null);
      }

      return game.getPlayers()
              .stream()
              .filter(player -> player.getCharacter().equals(winningCharacter))
              .findFirst()
              .orElse(null);
   }

   public static void setNextCurrentPlayer(Game game) {
      List<Player> players = game.getPlayers();
      Player prevCurrentPlayer = game.getCurrentPlayerAsPlayer();

      if (players == null || players.isEmpty()) {
         game.setCurrentPlayer(null);
         return;
      }

      if (prevCurrentPlayer == null) {
         game.setCurrentPlayer(players.get(0));
         return;
      }

      int i = players.indexOf(prevCurrentPlayer);

      Player currentPlayer;
      if (i == -1 || i + 1 == players.size()) {
         currentPlayer = players.get(0);
      } else {
         currentPlayer = players.get(i + 1);
      }

      game.setCurrentPlayer(currentPlayer);
   }

   public static void setActiveBoardFromMove(Move move, Game game) {
      game.getBoard().setActiveBoards(move.smallPosition());
   }

   public static void setPlayerWins(Game game){
      if (game == null) return;
      if (game.getPlayers() == null || game.getBoard() == null) return;

      for (Player player : game.getPlayers()) {
         Character ch = player.getCharacter();
         if (ch == null) {
            player.setNumberOfWins(0);
            continue;
         }
         int wins = game.getBoard().getNumberOfSmallWinsByChar(ch);
         player.setNumberOfWins(wins);
      }

   }
}