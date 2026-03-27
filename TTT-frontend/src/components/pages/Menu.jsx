import Header from "../organisms/Header";
import GameMenu from "../organisms/GameMenu";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../hooks/useAudio";
import "../../StyleCSS/global.css";

export default function MenuPage() {
  const navigate = useNavigate();
  const { play } = useAudio();

  return (
    <>
      <Header />
      <main className="app-container with-header">
        <div className="menu-container-fade-in">
          <GameMenu
            onStart={(config) => {
              play("gamestart");
              navigate("/game", { state: { config } });
            }}
          />
        </div>
      </main>
    </>
  );
}
