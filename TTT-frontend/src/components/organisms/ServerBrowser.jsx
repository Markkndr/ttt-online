import { useState, useEffect } from "react";
import { getAvailableGames } from "../../service/gameService";
import { useAuth } from "../../state/AuthContext";

export default function ServerBrowser({ onJoin }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    setLoading(true);
    const loadServers = async () => {
      try {
        const games = await getAvailableGames(accessToken);
        setServers(games);
      } catch (e) {
        console.error("Failed to load available games", e);
        setServers([]);
      }
      setLoading(false);
    };
    loadServers();
  }, []);

  return (
  <div className="menu-step-container">
    <h2 className="helptext">SERVER BROWSER</h2>

    <div className="menu-card list-card">
      <div className="load-list-wrapper">
        {loading && (
          <p className="status-msg loading">Scanning for matches...</p>
        )}

        {!loading && servers.length > 0 ? (
          servers.map((server) => (
            <div
              key={server.gameId}
              className="load-item"
              onClick={() => onJoin(server)}
            >
              <div className="load-info">
                <div className="game-name">{server.gameName}</div>
                <div className="game-meta">
                  Players: {server.currentPlayers} / {server.maxPlayers} | {" "}
                  Created by: {server.creator || "Unknown"}
                </div>
              </div>

              <button
                className="base-btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(server);
                }}
              >
                JOIN
              </button>
            </div>
          ))
        ) : (
          !loading && (
            <p className="status-msg empty">No active servers found.</p>
          )
        )}
      </div>
    </div>
  </div>
);
}
