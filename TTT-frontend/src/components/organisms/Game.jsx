import {useState, useMemo, useEffect} from "react";
import GiantBoard from "./GiantBoard";
import {useAudio} from "../../hooks/useAudio";
import {
  makeSmallBoards,
  makeEmptyBoard,
  getWinner,
  isFull3,
  nextActiveFromCell,
  anyPlayableBigs
} from "../../state/gameLogic";
import "../../StyleCSS/styles.css";

export default function Game({config, onExit}) {
    const [state, setState] = useState(null);
    const {play} = useAudio();
    const [boardEntering, setBoardEntering] = useState(false);
    const [playersEntering, setPlayersEntering] = useState(false);

  useEffect(() => {
    if (!config) {
      setState(null);
      return;
    }
    const smallBoards = makeSmallBoards();
    const bigBoard = makeEmptyBoard();
    const activeBigs = new Set([
      "0,0",
      "0,1",
      "0,2",
      "1,0",
      "1,1",
      "1,2",
      "2,0",
      "2,1",
      "2,2",
    ]);
    setState({
      smallBoards,
      bigBoard,
      activeBigs,
      rotation: config.rotation,
      moves: [],
    });
    setBoardEntering(true);
    setPlayersEntering(true);
  }, [config]);

    useEffect(() => {
        if (config && state && boardEntering) {
            const t = setTimeout(() => setBoardEntering(false), 30);
            return () => clearTimeout(t);
        }
    }, [config, state, boardEntering]);

    useEffect(() => {
        if (config && state && playersEntering) {
            const t = setTimeout(() => setPlayersEntering(false), 30);
            return () => clearTimeout(t);
        }
    }, [config, state, playersEntering]);

    const currentPlayer = useMemo(() => {
        if (!state || !config) return "";
        const n = state.moves.length;
        if (config.mode === "pvp" && config.playerCount === 3) {
            return state.rotation[n % 3];
        }
        return state.rotation[n % 2];
    }, [state, config]);

    const resolvedWinner = useMemo(() => {
        if (!state) return "";
        return getWinner(state.bigBoard);
    }, [state]);

    const resolvedDraw = useMemo(() => {
        if (!state) return false;
        if (getWinner(state.bigBoard)) return false;
        return isFull3(state.bigBoard);
    }, [state]);

    const handlePlay = (br, bc, sr, sc) => {
        if (!state) return;
        if (!state.activeBigs.has(`${br},${bc}`)) return;

        const sb = state.smallBoards.map((row) =>
            row.map((b) => b.map((r) => [...r])),
        );
        if (sb[br][bc][sr][sc]) {
            play("noclick");
            return;
        }
        play("click");
        sb[br][bc][sr][sc] = currentPlayer;

        const bb = state.bigBoard.map((r) => [...r]);

        const smallWinner = getWinner(sb[br][bc]);
        if (smallWinner) {
            bb[br][bc] = smallWinner;
        } else if (isFull3(sb[br][bc])) {
            bb[br][bc] = "D";
        }

        let activeBigs = nextActiveFromCell(sr, sc, bb);
        if (!anyPlayableBigs(activeBigs)) {
            activeBigs = new Set();
            for (let r = 0; r < 3; r++)
                for (let c = 0; c < 3; c++) if (!bb[r][c]) activeBigs.add(`${r},${c}`);
        }

        const moves = [
            ...state.moves,
            {bb: [br, bc], cell: [sr, sc], player: currentPlayer},
        ];

        setState({
            smallBoards: sb,
            bigBoard: bb,
            activeBigs,
            rotation: state.rotation,
            moves,
        });
    };

    const maybeAiTurn = async () => {
        if (!config || !state) return;
        if (config.mode !== "pve") return;
        const ai = config.rotation[1];
        const next = currentPlayer;
        if (next !== ai) return;

        await new Promise((r) => setTimeout(r, 300));

        const playable = [];
        state.activeBigs.forEach((key) => {
            const [br, bc] = key.split(",").map(Number);
            const board = state.smallBoards[br][bc];
            for (let sr = 0; sr < 3; sr++)
                for (let sc = 0; sc < 3; sc++) {
                    if (!board[sr][sc]) playable.push([br, bc, sr, sc]);
                }
        });
        if (!playable.length) return;
        const choice = playable[Math.floor(Math.random() * playable.length)];
        handlePlay(...choice);
        play("computer");
    };

    if (
        config &&
        state &&
        config.mode === "pve" &&
        !resolvedWinner &&
        !resolvedDraw
    ) {
        queueMicrotask(maybeAiTurn);
    }

    const onHover = () => play("hover");

    if (!config || !state) return null;

    return (
        <>
            <main>
                <div
                    id="playerOneElement"
                    className={`playerElement leftPlayer ${playersEntering ? "outLeft" : ""} ${currentPlayer === state.rotation[0] ? "activePlayer" : ""}`}
                >
                    {state.rotation[0]}
                </div>
                <div
                    id="playerTwoElement"
                    className={`playerElement rightPlayer ${playersEntering ? "outRight" : ""} ${currentPlayer === state.rotation[1] ? "activePlayer" : ""}`}
                >
                    {state.rotation[1]}
                </div>
                {config.mode === "pvp" && config.playerCount === 3 && (
                    <div
                        id="playerThreeElement"
                        className={`playerElement rightPlayer ${playersEntering ? "outAbove" : ""} ${currentPlayer === state.rotation[2] ? "activePlayer" : ""}`}
                        style={{top: "12%"}}
                    >
                        {state.rotation[2]}
                    </div>
                )}

                {!resolvedWinner && !resolvedDraw && (
                    <GiantBoard
                        smallBoards={state.smallBoards}
                        bigBoard={state.bigBoard}
                        activeBigs={state.activeBigs}
                        onPlay={handlePlay}
                        onHover={onHover}
                        entering={boardEntering}
                    />
                )}
                <button
                    className="game-exit-button"
                    onClick={() => onExit()}
                >
                    QUIT TO MENU
                </button>

                {(resolvedWinner || resolvedDraw) && (
                    <div
                        className={resolvedWinner ? "wonBigBoard" : "drawBigBoard"}
                        onClick={(e) => {
                            e.currentTarget.classList.add("fade-out");
                            setTimeout(() => {
                                if (onExit) onExit();
                            }, 500);
                        }}
                    >
                        {resolvedWinner ? resolvedWinner : state.rotation.join("/")}
                    </div>
                )}
            </main>
        </>
    );
}
