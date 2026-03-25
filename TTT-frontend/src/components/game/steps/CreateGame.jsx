import { useState } from "react";
import { createOnlineGame } from "../../../service/gameService";
import { useAuth } from "../../../state/AuthContext";

const CHARSET = ["◯", "✖", "△"];

export default function CreateGame({ onContinue, onBack }) {
  const [formData, setFormData] = useState({
    gameName: "",
    maxPlayerCount: 2,
    character: "◯",
  });
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const storedUserName = localStorage.getItem("userName");
      const body = await createOnlineGame(
        storedUserName,
        formData.gameName,
        parseInt(formData.maxPlayerCount, 10),
        formData.character,
        accessToken,
      );
      onContinue(body.id, formData.gameName);
    } catch (error) {
      console.error("Cant reach the backend! :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-step-container" style={{ opacity: 1 }}>
      <h2 className="helptext">CREATE ONLINE GAME</h2>

      <div className="menu-card">
        <form onSubmit={handleSubmit} className="menu-form-layout">
          <label className="form-label">Game Name</label>
          <input
            className="form-input"
            placeholder="Game Name"
            required
            value={formData.gameName}
            onChange={(e) =>
              setFormData({ ...formData, gameName: e.target.value })
            }
          />

          <div className="form-group" style={{ marginTop: "15px" }}>
            <label
              className="form-label"
              style={{ color: "white", marginRight: "10px" }}
            >
              Players:
            </label>
            <select
              className="form-input select-input"
              value={formData.maxPlayerCount}
              onChange={(e) =>
                setFormData({ ...formData, maxPlayerCount: e.target.value })
              }
            >
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: "20px" }}>
            <label
              className="form-label"
              style={{ color: "white", marginBottom: "10px" }}
            >
              Your character
            </label>
            <div className="char-grid">
              {CHARSET.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  className={`charChoice ${formData.character === ch ? "active-starter" : ""}`}
                  onClick={() => setFormData({ ...formData, character: ch })}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <div className="auth-actions">
            <button
              type="submit"
              className="base-btn btn-primary"
              disabled={loading}
            >
              {loading ? "Loading..." : "CREATE GAME"}
            </button>
            <button
              className="base-btn btn-ghost"
              type="button"
              onClick={() => onBack && onBack()}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
