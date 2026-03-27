import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../../hooks/useAudio";
import Login from "../organisms/Login";
import Register from "../organisms/Register";
import "../../StyleCSS/global.css";
import "../../StyleCSS/auth.css";

export default function AuthPage() {
  const { play } = useAudio();
  const navigate = useNavigate();
  const [authView, setAuthView] = useState("login");
  const [authEntering, setAuthEntering] = useState(false);

  const goMenu = () => {
    navigate("/menu");
  };

  const showView = (view) => {
    setAuthView(view);
    setAuthEntering(true);
    setTimeout(() => setAuthEntering(false), 700);
  };

  return (
    <main className="app-container">
      <div className="title-wrapper">
        <h1 className="title-display auth-mode">T T T</h1>
      </div>
      <div className="content-area">
        <div className="auth-view-container">
          {authView === "login" ? (
            <Login
              className={authEntering ? "fade-in-bottom" : ""}
              onSubmit={goMenu}
              onRegister={() => showView("register")}
            />
          ) : (
            <Register
              className={authEntering ? "fade-in-bottom" : ""}
              onBack={() => showView("login")}
              onSubmit={goMenu}
            />
          )}
        </div>
      </div>
    </main>
  );
}
