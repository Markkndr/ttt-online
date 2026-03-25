package com.codecool.tttbackend.domain.game.board;

import com.codecool.tttbackend.dao.model.game.Position;

import java.util.ArrayList;
import java.util.List;

public class BigBoard implements Board {
   private SmallBoard[][] smallBoards;

   public BigBoard() {
      smallBoards = new SmallBoard[3][3];
      for (int i = 0; i < 3; i++) {
         for (int j = 0; j < 3; j++) {
            smallBoards[i][j] = new SmallBoard();
            smallBoards[i][j].setPosition(new com.codecool.tttbackend.dao.model.game.Position(i, j));
            smallBoards[i][j].setActive(true);
         }
      }
   }

   public SmallBoard getSmallBoard(Position position) {
      return smallBoards[position.getRow()][position.getColumn()];
   }

   public void setSmallBoard(Position position, SmallBoard smallBoard) {
      smallBoard.setPosition(position);
      smallBoards[position.getRow()][position.getColumn()] = smallBoard;
   }

   public SmallBoard[][] getSmallBoards() {
      return smallBoards;
   }

   public void setSmallBoards(SmallBoard[][] smallBoards) {
      this.smallBoards = smallBoards;
   }

   public static BigBoard createBigBoard(String boardState, Position activeBoard) {
      if (boardState == null) {
         throw new NullPointerException("Big board cannot be created: input string is null!");
      }

      if (boardState.length() != 81) {
         throw new IllegalArgumentException(
             "Big board cannot be created: expected 81 characters but got " + boardState.length() + "!"
         );
      }

      BigBoard newBigBoard = new BigBoard();

      for (int sr = 0; sr < 3; sr++) {
         for (int sc = 0; sc < 3; sc++) {
            StringBuilder sb = new StringBuilder(9);

            int bigRowStart = sr * 3;
            int bigColStart = sc * 3;

            for (int r = 0; r < 3; r++) {
               int bigRow = bigRowStart + r;
               int rowBase = bigRow * 9;
               for (int c = 0; c < 3; c++) {
                  int bigCol = bigColStart + c;
                  sb.append(boardState.charAt(rowBase + bigCol));
               }
            }
            SmallBoard smallBoard = SmallBoard.smallBoardFromString(sb.toString());
            Position smallBoardPosition = new Position(sr, sc);
            // Set active: if no specific activeBoard is stored, make non-full boards active;
            // otherwise only the activeBoard is active. Avoid calling equals on a null activeBoard.
            if (activeBoard == null) {
               if (!smallBoard.isFull()) {
                  smallBoard.setActive(true);
               }
            } else if (activeBoard.equals(smallBoardPosition)) {
               smallBoard.setActive(true);
            }
            newBigBoard.setSmallBoard(smallBoardPosition, smallBoard);
         }
      }

      return newBigBoard;
   }

   public Character getWinningCharacter() {
      // Cache the small-board winners to avoid repeated calls and make comparisons explicit and null-safe
      Character a00 = smallBoards[0][0].getWinningCharacter();
      Character a01 = smallBoards[0][1].getWinningCharacter();
      Character a02 = smallBoards[0][2].getWinningCharacter();

      Character a10 = smallBoards[1][0].getWinningCharacter();
      Character a11 = smallBoards[1][1].getWinningCharacter();
      Character a12 = smallBoards[1][2].getWinningCharacter();

      Character a20 = smallBoards[2][0].getWinningCharacter();
      Character a21 = smallBoards[2][1].getWinningCharacter();
      Character a22 = smallBoards[2][2].getWinningCharacter();

      // rows
      if (isWinner(a00, a01, a02)) return a00;
      if (isWinner(a10, a11, a12)) return a10;
      if (isWinner(a20, a21, a22)) return a20;

      // cols
      if (isWinner(a00, a10, a20)) return a00;
      if (isWinner(a01, a11, a21)) return a01;
      if (isWinner(a02, a12, a22)) return a02;

      // diagonals
      if (isWinner(a00, a11, a22)) return a00;
      if (isWinner(a02, a11, a20)) return a02;

      // full big board -> draw
      if (isFull()) return 'D';
      return null;
   }

   // Helper to determine if three small-board winners form a valid big-board win
   private boolean isWinner(Character c1, Character c2, Character c3) {
      if (c1 == null || c2 == null || c3 == null) return false;
      // ignore small-board draws
      if (c1 == 'D' || c2 == 'D' || c3 == 'D') return false;
      // compare primitive char values to avoid reference-equality issues
      return c1.charValue() == c2.charValue() && c1.charValue() == c3.charValue();
   }

   public boolean isFull() {
      for (int r = 0; r < 3; r++) {
         for (int c = 0; c < 3; c++) {
            if (smallBoards[r][c].getWinningCharacter() == null) return false;
         }
      }
      return true;
   }

   public int getNumberOfSmallWinsByChar(char character) {
      int numberOfSmallWins = 0;
      for (int r = 0; r < 3; r++) {
         for (int c = 0; c < 3; c++) {
            Character winner = smallBoards[r][c].getWinningCharacter();
            if (winner != null && winner.charValue() == character) {
               numberOfSmallWins++;
            }
         }
      }
      return numberOfSmallWins;
   }

   public char getCell(int br, int bc, int sr, int sc) {
      return smallBoards[br][bc].getCell(sr, sc);
   }

   public void makeMove(char character, Position bigPosition, Position smallPosition) {
      SmallBoard smallBoard = smallBoards[bigPosition.getRow()][bigPosition.getColumn()];
      smallBoard.setCell(smallPosition.getRow(), smallPosition.getColumn(), character);
   }

   public List<Position> getActiveBoardPositions() {
      List<Position> activeBoards = new ArrayList<>();
      for (SmallBoard[] row : smallBoards) {
         for (SmallBoard smallBoard : row) {
            if (smallBoard.isActive()) activeBoards.add(smallBoard.getPosition());
         }
      }
      return activeBoards;
   }

   @Override
   public String toString() {
      StringBuilder sb = new StringBuilder(81);

      for (int bigRow = 0; bigRow < 9; bigRow++) {
         int sr = bigRow / 3;      // which small-board row
         int innerRow = bigRow % 3; // row within that small board

         for (int bigCol = 0; bigCol < 9; bigCol++) {
            int sc = bigCol / 3;       // which small-board column
            int innerCol = bigCol % 3; // col within that small board

            SmallBoard small = smallBoards[sr][sc];
            if (small == null || small.getCells() == null) {
               sb.append('_');
               continue;
            }

            Character ch = small.getCells()[innerRow][innerCol];
            sb.append(ch == null ? '_' : ch);
         }
      }

      return sb.toString();
   }

   public void setActiveBoards(Position position) {
      if (position != null && getSmallBoard(position).getWinningCharacter() == null) {
            setActiveAllNonFullBoards(false);
            smallBoards[position.getRow()][position.getColumn()].setActive(true);
      } else {
         setActiveAllNonFullBoards(true);
      }
   }

   private void setActiveAllNonFullBoards(boolean isActive) {
      for (SmallBoard[] row : smallBoards) {
         for (SmallBoard smallBoard : row) {
            if ((smallBoard.isFull() && smallBoard.isActive()) || smallBoard.getWinningCharacter() != null) {
               smallBoard.setActive(false);
            } else {
               smallBoard.setActive(isActive);
            }
         }
      }
   }

   public String[][] toBigBoardStrings() {
      String[][] big = new String[3][3];
      for (int br = 0; br < 3; br++) {
         for (int bc = 0; bc < 3; bc++) {
            SmallBoard sb = smallBoards[br][bc];
            if (sb == null) {
               big[br][bc] = "";
               continue;
            }

            Character winner = sb.getWinningCharacter();
            if (winner == null) {
               // no winner for this small board
               big[br][bc] = sb.isFull() ? "D" : "";
            } else if (winner == 'D') {
               // draw
               big[br][bc] = "D";
            } else {
               // a player won this small board
               big[br][bc] = String.valueOf(winner);
            }
         }
      }
      return big;
   }

   public String[][][][] toSmallBoardsStrings() {
      String[][][][] out = new String[3][3][3][3];

      for (int br = 0; br < 3; br++) {
         for (int bc = 0; bc < 3; bc++) {
            SmallBoard sb = smallBoards[br][bc];
            Character[][] cells = (sb == null) ? null : sb.getCells();

            for (int sr = 0; sr < 3; sr++) {
               for (int sc = 0; sc < 3; sc++) {
                  Character ch = (cells == null) ? null : cells[sr][sc];
                  out[br][bc][sr][sc] = (ch == null || ch == '_') ? "" : String.valueOf(ch);
               }
            }
         }
      }

      return out;
   }
}
