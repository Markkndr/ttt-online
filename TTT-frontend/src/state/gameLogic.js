export const makeEmptyBoard = () => [['', '', ''], ['', '', ''], ['', '', '']];

export const makeSmallBoards = () => [
  [makeEmptyBoard(), makeEmptyBoard(), makeEmptyBoard()],
  [makeEmptyBoard(), makeEmptyBoard(), makeEmptyBoard()],
  [makeEmptyBoard(), makeEmptyBoard(), makeEmptyBoard()],
];


export function getWinner(board3) {
  for (let i = 0; i < 3; i++) {
    if (board3[i][0] && board3[i][0] !== 'D' && board3[i][0] === board3[i][1] && board3[i][1] === board3[i][2]) return board3[i][0];
    if (board3[0][i] && board3[0][i] !== 'D' && board3[0][i] === board3[1][i] && board3[1][i] === board3[2][i]) return board3[0][i];
  }
  if (board3[0][0] && board3[0][0] !== 'D' && board3[0][0] === board3[1][1] && board3[1][1] === board3[2][2]) return board3[0][0];
  if (board3[0][2] && board3[0][2] !== 'D' && board3[0][2] === board3[1][1] && board3[1][1] === board3[2][0]) return board3[0][2];
  return '';
}

export function isFull3(board3) {
  return !board3[0].includes('') && !board3[1].includes('') && !board3[2].includes('');
}

export function nextActiveFromCell(cellR, cellC, bigBoard) {
  if (!bigBoard[cellR][cellC]) return new Set([`${cellR},${cellC}`]);
  const set = new Set();
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (!bigBoard[r][c]) set.add(`${r},${c}`);
  return set;
}

export function anyPlayableBigs(activeBigs) {
  return activeBigs && activeBigs.size > 0;
}
