package com.codecool.tttbackend.domain.game.board;

import com.codecool.tttbackend.dao.model.game.Position;

public class SmallBoard implements Board {
   private Character[][] cells;
   private Position position;
   private boolean isActive;

   public SmallBoard() {
      cells = new Character[3][3];
   }

   public void setCell(int row, int column, char character) {
      cells[row][column] = character;
   }

   public char getCell(int row, int column) {
      if (cells[row][column] == null) return '_';
      return cells[row][column];
   }

   public Character[][] getCells() {
      return cells;
   }

   public void setCells(Character[][] cells) {
      this.cells = cells;
   }

   public static SmallBoard smallBoardFromString(String smallBoardState) {
      if (smallBoardState == null) {
         throw new NullPointerException("Small board cannot be created: input string is null!");
      }
      if (smallBoardState.length() != 9) {
         throw new IllegalArgumentException(
             "Small board cannot be created: expected 9 characters but got " + smallBoardState.length() + "!"
         );
      }

      SmallBoard newSmallBoard = new SmallBoard();

      for (int i = 0; i < 9; i++) {
         char ch = smallBoardState.charAt(i);
         if (ch == '_') continue;
         int row = i / 3;
         int column = i % 3;
         newSmallBoard.setCell(row, column, ch);
      }

      return newSmallBoard;
   }

   public Character getWinningCharacter() {
      // Use getCell which returns '_' for empty cells, compare primitive chars to avoid null/Character pitfalls
      for (int i = 0; i < 3; i++) {
         char a = getCell(i, 0);
         char b = getCell(i, 1);
         char c = getCell(i, 2);
         if (a != '_' && a == b && b == c) return a;

         a = getCell(0, i);
         b = getCell(1, i);
         c = getCell(2, i);
         if (a != '_' && a == b && b == c) return a;
      }

      char d1 = getCell(0, 0);
      char d2 = getCell(1, 1);
      char d3 = getCell(2, 2);
      if (d1 != '_' && d1 == d2 && d2 == d3) return d1;

      char e1 = getCell(0, 2);
      char e2 = getCell(1, 1);
      char e3 = getCell(2, 0);
      if (e1 != '_' && e1 == e2 && e2 == e3) return e1;

      if (isFull()) return 'D';
      return null;
   }

   public boolean isFull() {
      for (int r = 0; r < 3; r++) {
         for (int c = 0; c < 3; c++) {
            if (cells[r][c] == null || cells[r][c] == '_') return false;
         }
      }
      return true;
   }

   public boolean isActive() {
      return isActive;
   }

   public void setActive(boolean active) {
      isActive = active;
   }

   public Position getPosition() {
      return position;
   }

   public void setPosition(Position position) {
      this.position = position;
   }
}
