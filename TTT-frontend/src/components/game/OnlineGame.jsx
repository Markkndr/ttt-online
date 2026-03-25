import { useState, useMemo, useEffect } from "react";
import GiantBoard from "./GiantBoard";
import { useAudio } from "../../hooks/useAudio";
import { useWebSocket } from "../../state/WebSocketContext";
import { getWinner, isFull3 } from "../../state/gameLogic";
import { getGameStatus, startOnlineGame } from "../../service/gameService";
import { useAuth } from "../../state/AuthContext";

export default function OnlineGame({ config, onExit }) {
  const [state, setState] = useState(null);
  const { play } = useAudio();
  const [boardEntering, setBoardEntering] = useState(false);
  const [playersEntering, setPlayersEntering] = useState(false);
  const { subscribe, send } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [myTurn, setMyTurn] = useState(true);
  const [pendingMove, setPendingMove] = useState(null); // optimistic move
  const { accessToken } = useAuth();
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    console.log("currentPlayer from server:", state?.currentPlayer);
    console.log("local userName:", localStorage.getItem("userName"));
    console.log("myTurn:", !!myTurn);
  }, [state?.currentPlayer]);

  useEffect(() => {
    setMyTurn(state?.currentPlayer && state.currentPlayer.username == userName);
  }, [state]);

  useEffect(() => {
    if (!config?.gameId) return;
    const loadState = async () => {
      setLoading(true);
      try {
        const gameState = await getGameStatus(accessToken, config.gameId);

        const activeBigs = new Set(gameState.activeBoards ?? []);
        setState({
          ...gameState,
          activeBigs,
        });
        setPendingMove(null);
      } catch (error) {
        console.error("Cant reach the backend! :", error);
      } finally {
        setLoading(false);
      }
    };

    loadState();

    const destination = `/topic/games/${config.gameId}`;

    const sub = subscribe(destination, (msg) => {
      let body;
      try {
        body = JSON.parse(msg.body);
      } catch (err) {
        console.error("Invalid WS message JSON:", err, msg.body);
        return;
      }
      if (body.winner) console.log("Incoming GameState message from server");
      console.log("body.smallBoards:", body.smallBoards);
      console.log("body.bigBoard:", body.bigBoard);

      setState(() => ({
        ...body,
        activeBigs: new Set(body.activeBoards ?? []),
      }));
      // server state has arrived, drop any optimistic move
      setPendingMove(null);
    });

    if (sub) {
      console.log("WS subscribed successfully to", destination, sub);
    } else {
      console.warn(
        "WS subscription not active yet (client not connected?)",
        destination,
      );
    }

    console.log("Config: ", config);

    return () => {
      try {
        sub && sub.unsubscribe && sub.unsubscribe();
        console.log("WS unsubscribed from", destination);
      } catch (err) {
        console.warn("Failed to unsubscribe:", err);
      }
    };
  }, [config?.gameId, subscribe]);

  useEffect(() => {
    console.log("Updated game state:", state);
  }, [state]);

  useEffect(() => {
    if (state?.started) {
      setBoardEntering(true);
      setPlayersEntering(true);
    }
  }, [state?.started]);

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

  const resolvedWinner = useMemo(() => {
    if (!state || !state.winner) return false;
    return state.winner.character; // '✖' or '◯'
  }, [state]);

  const resolvedDraw = useMemo(() => {
    if (!state || !state.bigBoard) return false;
    if (getWinner(state.bigBoard)) return false;
    return isFull3(state.bigBoard);
  }, [state]);

  // smallBoards including any local optimistic move so the user sees their
  // mark immediately, before the server confirms it
  const displaySmallBoards = useMemo(() => {
    if (!state?.smallBoards) return state?.smallBoards;
    if (!pendingMove) return state.smallBoards;

    const { br, bc, sr, sc, char } = pendingMove;

    // if server already filled this cell, don't override it
    if (state.smallBoards[br]?.[bc]?.[sr]?.[sc]) {
      return state.smallBoards;
    }

    const sb = state.smallBoards.map((row) =>
      row.map((b) => b.map((r) => [...r])),
    );

    sb[br][bc][sr][sc] = char || state.currentPlayer?.character || "";
    return sb;
  }, [state?.smallBoards, state?.currentPlayer, pendingMove]);

  const showGameScreen =
    !loading && (state?.started || resolvedWinner || resolvedDraw);

  const handlePlay = async (br, bc, sr, sc) => {
    console.log("Entered handlePlay!");
    console.log(
      "Making move - br: " + br + " bc: " + bc + " sr: " + sr + " sc: " + sc,
    );
    if (!state) {
      console.log("handlePlay fails: No state");
      return;
    }
    if (!myTurn) {
      console.log("handlePlay fails: Not your turn!");
      return;
    }
    if (!state.activeBigs?.has(`${br},${bc}`)) {
      console.log("handlePlay fails: Board not active");
      return;
    }

    const sb = state.smallBoards.map((row) =>
      row.map((b) => b.map((r) => [...r])),
    );

    if (sb[br][bc][sr][sc]) {
      play("noclick");
      return;
    }
    play("click");

    // optimistic move: mark locally so player sees it immediately
    setPendingMove({ br, bc, sr, sc, char: state.currentPlayer?.character });

    send(`/app/${config.gameId}/move`, {
      userName,
      br,
      bc,
      sr,
      sc,
    });
  };

  const onHover = () => play("hover");

  if (!config || !state) return null;
  console.log("userName:", JSON.stringify(userName), typeof userName);
  console.log(
    "config.creator:",
    JSON.stringify(config.creator),
    typeof config.creator,
  );
  console.log("equal? ", userName === config.creator);
  return (
    <>
      {loading && (
        <main>
          <div>Loading...</div>
        </main>
      )}
      {showGameScreen ? (
        <main>
          <div
            id="playerOneElement"
            className={`playerElement leftPlayer ${playersEntering ? "outLeft" : ""} ${state?.currentPlayer?.character === state.rotation[0][1] ? "activePlayer" : ""}`}
          >
            <div
              className={`playerElement-character ${state?.currentPlayer?.character === state.rotation[0][1] ? "activePlayer-character" : ""}`}
            >
              {state.rotation[0][1]}
            </div>
            <div>{state.rotation[0][0]}</div>
          </div>
          <div
            id="playerTwoElement"
            className={`playerElement rightPlayer ${playersEntering ? "outRight" : ""} ${state?.currentPlayer?.character === state.rotation[1][1] ? "activePlayer" : ""}`}
          >
            <div
              className={`playerElement-character ${state?.currentPlayer?.character === state.rotation[1][1] ? "activePlayer-character" : ""}`}
            >
              {state.rotation[1][1]}
            </div>
            <div>{state.rotation[1][0]}</div>
          </div>
          {state.rotation.length === 3 && (
            <div
              id="playerThreeElement"
              className={`playerElement rightPlayer ${playersEntering ? "outAbove" : ""} ${state?.currentPlayer?.character === state.rotation[2][1] ? "activePlayer" : ""}`}
              style={{ top: "12%" }}
            >
              <div
                className={`playerElement-character ${state?.currentPlayer?.character === state.rotation[1][1] ? "activePlayer-character" : ""}`}
              >
                {state.rotation[2][1]}
              </div>
              <div>{state.rotation[2][0]}</div>
            </div>
          )}

          {!resolvedWinner && !resolvedDraw && (
            <GiantBoard
              smallBoards={displaySmallBoards}
              bigBoard={state.bigBoard}
              activeBigs={state.activeBigs}
              canPlay={myTurn}
              onPlay={handlePlay}
              onHover={onHover}
              entering={boardEntering}
              pendingMove={pendingMove}
            />
          )}

          {(resolvedWinner || resolvedDraw) && (
            <div
              className={resolvedWinner ? "wonBigBoard" : "drawBigBoard"}
              onClick={(e) => {
                e.currentTarget.classList.add("fade-out");
                onExit();
              }}
            >
              {resolvedWinner
                ? resolvedWinner
                : Object.values(state.rotation || {}).join("/")}
            </div>
          )}
        </main>
      ) : (
        <main>
          {!loading &&
            !state.started &&
            state.winner == null &&
            userName != config.creator && (
              <h2 className={`helptext waiting`}>
                WAITING FOR GAME TO START...
              </h2>
            )}
          {!loading &&
            !state.started &&
            userName == config.creator &&
            state?.rotation?.length > 1 && (
              <h2 className={`helptext waiting`}>
                WAIT FOR MORE PLAYERS OR START THE GAME...
              </h2>
            )}
          {!loading &&
            userName == config.creator &&
            state?.rotation?.length == 1 && (
              <h2 className={`helptext waiting`}>
                WAITING FOR MORE PLAYERS TO JOIN...
              </h2>
            )}
          {!loading && state?.rotation && (
            <div className="player-list">
              {state.rotation.map((player) => (
                <div className="waitingPlayer">
                  <div className="waitingPlayer-character">
                    {player[1]}
                  </div>
                  <div className="waitingPlayer-name">{player[0]}</div>
                </div>
              ))}
            </div>
          )}
          {state.winner == null &&
            userName == config.creator &&
            state?.rotation?.length > 1 && (
              <button
                className="base-btn btn-primary start-game"
                onMouseOver={() => play("hover")}
                onClick={async () => {
                  play("gamestart");
                  try {
                    await startOnlineGame(accessToken, config.gameId);
                  } catch (error) {
                    console.error("Can't start online game: " + error);
                  }
                }}
              >
                START GAME
              </button>
            )}
        </main>
      )}
      {!loading && (
        <button className="back-button-modern" onClick={onExit}>
          <span className="arrow-icon">←</span>
        </button>
      )}
      <div className="game-title">{`"${config.gameName}"`}</div>
      {state?.winner && (
        <div className="winner">
          <div className="winner-name">
            {state.winner.username == userName
              ? "YOU WON!"
              : `winner: ${state.winner.username}`}
          </div>
          <div className="winner-score">{`(small boards won: ${state.winner.numberOfWins})`}</div>
        </div>
      )}
    </>
  );
}
