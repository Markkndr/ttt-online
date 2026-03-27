import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import AuthPage from "./components/pages/Auth";
import MenuPage from "./components/pages/Menu";
import GamePage from "./components/pages/GamePage";
import "./StyleCSS/global.css";
import ProtectedRoute from "./state/ProtectedRoute";

export default function App() {
  return (
    <main>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/game" element={<GamePage />} />
          </Route>
        </Routes>
      </Router>
    </main>
  );
}
