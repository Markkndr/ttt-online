import { useLocation, useNavigate } from "react-router-dom";
import Game from "../organisms/Game";
import OnlineGame from "../organisms/OnlineGame";
import "../../StyleCSS/global.css";

export default function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state?.config;

  if (!config) {
    // If someone hits /game directly, just send them back to the menu
    navigate("/menu", { replace: true });
    return null;
  }

  const handleExit = () => {
    navigate("/menu");
  };

  if (config.mode === "online") {
    return (
      <OnlineGame
        config={config}
        onExit={handleExit}
      />
    );
  }

  return (
    <Game
      config={config}
      onExit={handleExit}
    />
  );
}
