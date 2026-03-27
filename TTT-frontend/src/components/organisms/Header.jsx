import "../../StyleCSS/global.css";
import { useUser } from "../../state/UserContext";

export default function Header() {
  const { user, refreshUser } = useUser();

  return (
    <header className="game-header">
      <div className="header-content">
        <div className="brand">
          <span className="logo-dot"></span>
          <span className="logo-text">TTT ONLINE</span>
        </div>
        <div className="user-profile-badge">
          <div className="user-info">
            <span className="user-label">LOGGED IN AS: </span>
            <span className="user-name">
              {localStorage.getItem("userName") || "Guest"}
            </span>
          </div>
          <div className="user-avatar">
            {user?.profileImage ? (
              <img
                src={`data:image/jpeg;base64,${user.profileImage}`}
                alt="Profile"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              user?.username?.charAt(0).toUpperCase() || "P"
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
