import { useState, useEffect } from "react";
import { getMyGames, startOnlineGame } from "../../../service/gameService";
import { useAuth } from "../../../state/AuthContext";

export default function OnlineLoadList({ onSelect, onStartGame }) {
  const [savedGames, setSavedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    setLoading(true);
    const loadServers = async () => {
      try {
        const games = await getMyGames(accessToken);
        setSavedGames(games);
      } catch (e) {
        console.error("Failed to load user's games", e);
        setSavedGames([]);
      }
      setLoading(false);
    };
    loadServers();
  }, []);

  return (
    <div className="menu-step.container">
      <h2 className="helptext">RESUME ONLINE GAME</h2>
      <div className="menu-card list-card">
        <div className="load-list-wrapper">
          {loading && <p className="status-msg loading">Loading...</p>}
          {error && <p className="status-msg error">{error}</p>}

          {!loading && savedGames.length > 0
            ? [...savedGames]
                .sort((a, b) => {
                  const aReady = a.currentPlayers >= 2 ? 1 : 0;
                  const bReady = b.currentPlayers >= 2 ? 1 : 0;
                  if (aReady !== bReady) return bReady - aReady;
                  return a.gameId - b.gameId;
                })
                .map((game) => (
                  <div key={game.gameId} className="load-item">
                    <div className="load-info">
                      <div className="game-name">{game.gameName}</div>
                      <div className="game-meta">
                        State: {game.state} | Created by:{" "}
                        {game.creator ? game.creator : "Unknown"}
                      </div>
                    </div>
                    {game.state == "IN_PROGRESS" ? (
                      <button
                        className="base-btn btn-primary"
                        onClick={() => onSelect(game)}
                      >
                        OPEN
                      </button>
                    ) : game.currentPlayers < 2 ? (
                      <h6>WAITING FOR PLAYERS TO JOIN...</h6>
                    ) : game.creator == localStorage.getItem("userName") ? (
                      <button
                        className="base-btn btn-primary"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await onStartGame(game);
                        }}
                      >
                        START
                      </button>
                    ) : (
                      <h6>WAITING FOR GAME TO START...</h6>
                    )}
                  </div>
                ))
            : !loading && (
                <p className="status-msg empty">No active games found.</p>
              )}
        </div>
      </div>
    </div>
  );
}
