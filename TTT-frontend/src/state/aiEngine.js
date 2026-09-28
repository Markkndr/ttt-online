// AI engine for single-player (vs computer) ultimate tic-tac-toe.
//
// chooseMove() returns a move [br, bc, sr, sc] for the AI given the current
// board state and a difficulty level:
//   easy       - random legal move
//   medium     - shallow search, plays reasonably but makes occasional mistakes
//   hard        - deeper alpha-beta search
//   unbeatable - deepest alpha-beta search, no deliberate mistakes
//
// The search is bounded by a node budget so it always returns quickly and the
// browser never freezes; if the budget is hit it falls back to the heuristic.

import { getWinner, isFull3, nextActiveFromCell } from "./gameLogic.js";

const WIN = 1_000_000;

// Positional value of each cell on the big board (center > corners > edges).
const BIG_WEIGHTS = [
  [3, 2, 3],
  [2, 4, 2],
  [3, 2, 3],
];

const LINES = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

const cloneSmall = (sb) => sb.map((row) => row.map((b) => b.map((r) => [...r])));
const cloneBig = (bb) => bb.map((r) => [...r]);

function legalMoves(sb, bb, activeBigs) {
  const moves = [];
  activeBigs.forEach((key) => {
    const [br, bc] = key.split(",").map(Number);
    if (bb[br][bc]) return; // board already decided
    const board = sb[br][bc];
    for (let sr = 0; sr < 3; sr++) {
      for (let sc = 0; sc < 3; sc++) {
        if (!board[sr][sc]) moves.push([br, bc, sr, sc]);
      }
    }
  });
  return moves;
}

function applyMove(sb, bb, move, player) {
  const [br, bc, sr, sc] = move;
  const nsb = cloneSmall(sb);
  const nbb = cloneBig(bb);
  nsb[br][bc][sr][sc] = player;

  const w = getWinner(nsb[br][bc]);
  if (w) nbb[br][bc] = w;
  else if (isFull3(nsb[br][bc])) nbb[br][bc] = "D";

  let active = nextActiveFromCell(sr, sc, nbb);
  active = new Set(
    [...active].filter((k) => {
      const [r, c] = k.split(",").map(Number);
      return !nbb[r][c];
    }),
  );
  if (active.size === 0) {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) if (!nbb[r][c]) active.add(`${r},${c}`);
  }
  return { sb: nsb, bb: nbb, active };
}

// Scores a 3x3 grid for `me` vs `opp`. A drawn ("D") cell blocks a line for both.
function lineScore(grid, me, opp) {
  let score = 0;
  for (const line of LINES) {
    let mine = 0;
    let theirs = 0;
    for (const [r, c] of line) {
      const v = grid[r][c];
      if (v === "D") {
        mine++;
        theirs++;
      } else if (v === me) mine++;
      else if (v && v === opp) theirs++;
    }
    if (mine > 0 && theirs === 0) score += mine === 2 ? 5 : 1;
    else if (theirs > 0 && mine === 0) score -= theirs === 2 ? 5 : 1;
  }
  return score;
}

function evaluate(sb, bb, me, opp) {
  const bigWinner = getWinner(bb);
  if (bigWinner === me) return WIN;
  if (bigWinner === opp) return -WIN;

  let score = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const w = BIG_WEIGHTS[r][c];
      const cell = bb[r][c];
      if (cell === me) score += 100 * w;
      else if (cell && cell !== "D" && cell === opp) score -= 100 * w;
      else if (cell === "") score += lineScore(sb[r][c], me, opp) * w * 0.5;
    }
  }
  // Threats on the big board itself matter most.
  score += lineScore(bb, me, opp) * 30;
  return score;
}

function search(sb, bb, active, depth, alpha, beta, me, opp, toMove, budget) {
  const bigWinner = getWinner(bb);
  // Prefer faster wins / slower losses by folding remaining depth into the score.
  if (bigWinner === me) return WIN + depth;
  if (bigWinner === opp) return -WIN - depth;
  if (depth === 0 || ++budget.nodes > budget.max) return evaluate(sb, bb, me, opp);

  const moves = legalMoves(sb, bb, active);
  if (moves.length === 0) return evaluate(sb, bb, me, opp);

  const maximizing = toMove === me;
  let best = maximizing ? -Infinity : Infinity;
  for (const mv of moves) {
    const { sb: ns, bb: nb, active: na } = applyMove(sb, bb, mv, toMove);
    const val = search(
      ns, nb, na, depth - 1, alpha, beta, me, opp,
      toMove === me ? opp : me, budget,
    );
    if (maximizing) {
      if (val > best) best = val;
      if (best > alpha) alpha = best;
    } else {
      if (val < best) best = val;
      if (best < beta) beta = best;
    }
    if (beta <= alpha) break; // alpha-beta cutoff
  }
  return best;
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const SETTINGS = {
  medium: { depth: 2, budget: 8_000, mistakeChance: 0.3 },
  hard: { depth: 4, budget: 60_000, mistakeChance: 0.05 },
  unbeatable: { depth: 6, budget: 200_000, mistakeChance: 0 },
};

/**
 * Pick the AI's move.
 * @param {object} gs - { smallBoards, bigBoard, activeBigs, aiChar, oppChar }
 * @param {string} difficulty - easy | medium | hard | unbeatable
 * @returns {number[]|null} [br, bc, sr, sc] or null when no move is possible
 */
export function chooseMove(gs, difficulty = "easy") {
  const { smallBoards, bigBoard, activeBigs, aiChar, oppChar } = gs;
  const moves = legalMoves(smallBoards, bigBoard, activeBigs);
  if (moves.length === 0) return null;

  const cfg = SETTINGS[difficulty];
  // Easy, or a deliberate slip on medium/hard: just play randomly.
  if (!cfg || Math.random() < cfg.mistakeChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const budget = { nodes: 0, max: cfg.budget };
  const ordered = shuffle(moves); // randomize tie-breaks so play isn't predictable
  let bestMove = ordered[0];
  let bestVal = -Infinity;
  let alpha = -Infinity;
  for (const mv of ordered) {
    const { sb, bb, active } = applyMove(smallBoards, bigBoard, mv, aiChar);
    const val = search(
      sb, bb, active, cfg.depth - 1, alpha, Infinity, aiChar, oppChar, oppChar, budget,
    );
    if (val > bestVal) {
      bestVal = val;
      bestMove = mv;
    }
    if (val > alpha) alpha = val;
  }
  return bestMove;
}
