import { useNavigate } from "react-router-dom";
import { useAudio } from "../../hooks/useAudio";
import "../../StyleCSS/global.css";

export default function Home() {
  const { play } = useAudio();
  const navigate = useNavigate();

  return (
    <main className="app-container">
      <div className="title-wrapper">
        <h1
          className={"title-display pulse-animation"}
          onClick={() => {
            play("click");
            navigate("/auth");
          }}
        >
          T T T
        </h1>
      </div>
    </main>
  );
}