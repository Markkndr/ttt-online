package com.codecool.tttbackend.domain.game;

import com.codecool.tttbackend.dao.model.game.Position;
import com.codecool.tttbackend.domain.game.board.BigBoard;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BigBoardDtoViewTests {

   @Test
   void toSmallBoardsStrings_mapsNullAndUnderscoreToEmptyString() {
      // '_' means empty in your string format.
      BigBoard bigBoard = BigBoard.createBigBoard("_".repeat(81), null);

      String[][][][] smallBoards = bigBoard.toSmallBoardsStrings();

      assertEquals("", smallBoards[0][0][0][0]);
      assertEquals("", smallBoards[2][2][2][2]);
   }

   @Test
   void toSmallBoardsStrings_mapsCharactersToSingleCharStrings() {
      StringBuilder state = new StringBuilder("_".repeat(81));

      // Put an X in the global (bigRow=0, bigCol=0) => small[0][0] cell[0][0]
      state.setCharAt(0, 'X');

      BigBoard bigBoard = BigBoard.createBigBoard(state.toString(), new Position(0, 0));
      String[][][][] smallBoards = bigBoard.toSmallBoardsStrings();

      assertEquals("X", smallBoards[0][0][0][0]);
   }

   @Test
   void toBigBoardStrings_isEmptyWhenNoSmallBoardHasWinner() {
      BigBoard bigBoard = BigBoard.createBigBoard("_".repeat(81), null);
      String[][] big = bigBoard.toBigBoardStrings();

      assertEquals("", big[0][0]);
      assertEquals("", big[1][2]);
   }
}
