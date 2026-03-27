import { useState } from "react";
import { useAudio } from "../../hooks/useAudio.js";
import "../../StyleCSS/menu.css";
import "../../StyleCSS/global.css";
import CreateGame from "./CreateGame.jsx";
import ServerBrowser from "./ServerBrowser.jsx";
import OnlineLoadList from "./OnlineLoadList.jsx";
import { joinOnlineGame, startOnlineGame } from "../../service/gameService.js";
import Profile from "./Profile.jsx";
import { useAuth } from "../../state/AuthContext";

const CHARSET = ["◯", "✖", "△"];

export default function GameMenu({onStart}) {
    const {play} = useAudio();
    const { accessToken } = useAuth();

    const [mode, setMode] = useState(null); // 'pvp' | 'pve'
    const [onlineType, setOnlineType] = useState(null); // 'quick' | 'browser'
    const [playerCount, setPlayerCount] = useState(2);
    const [difficulty, setDifficulty] = useState("easy"); // easy|medium|hard|unbeatable
    const [chars, setChars] = useState([]); // chosen tokens in order
    const [rotation, setRotation] = useState([]); // chosen start order (tokens)
    const [menuStep, setMenuStep] = useState("startMenu"); // mode | multiType | onlineType | pvpCount | pveDiff | serverBrowser | char | start | leaving
    const [leaving, setLeaving] = useState(false);
    const [entering, setEntering] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentGameId, setCurrentGameId] = useState(null);
    const [selectedServer, setSelectedServer] = useState(null);
    const [selectedOnlineChar, setSelectedOnlineChar] = useState(null);
    const [userData, setUserData] = useState({ wins: 0, losses: 0, gamesPlayed: 0 });

  const requiredChars = mode === "pvp" ? playerCount : 2;
  const takenOnlineChars = selectedServer?.characters || [];
  const availableOnlineChars = CHARSET.filter(
    (ch) => !takenOnlineChars.includes(ch),
  );
  const userName = localStorage.getItem("userName");

  const go = (next) => {
    setMenuStep(next);
    setEntering(true);
    setTimeout(() => setEntering(false), 30);
  };

  const finishConfigAndStart = (finalRotation) => {
    setLeaving(true);
    setTimeout(() => {
      play("gamestart");
      go("game");
      onStart({
        mode,
        playerCount,
        difficulty,
        chars,
        rotation: finalRotation,
      });
    }, 400);
  };

    const startGame = () => {
        play("gamestart");
        setMenuStep("game");
        onStart({mode, playerCount, difficulty, chars, rotation});
    };
    const back = () => {
        play("click");

        switch (menuStep) {
            case "mode":
                go("startMenu");
                break;
            case "multiType":
                go("mode");
                break;
            case "onlineType":
                go("multiType");
                break;
            case "pvpCount":
                go("multiType");
                break;
            case "pveDiff":
                go("mode");
                break;
            case "serverBrowser":
                go("onlineType");
                break;
            case "createGame":
                go("onlineType");
                break;
            case "quick-match":
                go("onlineType");
                break;
            case "char":
                if (mode === "pve") {
                    go("pveDiff");
                } else if (mode === "online") {
                    if (onlineType === "create") {
                        go("createGame");
                    } else if (onlineType === "quick") {
                        go("onlineType");
                    } else if (onlineType === "browser") {
                        go("serverBrowser");
                    } else {
                        go("onlineType");
                    }
                } else {
                    go("pvpCount");
                }
                break;
            case "onlineLoadList":
                go("onlineType");
                break;
            case "onlineJoinChar":
                setSelectedOnlineChar(null);
                setSelectedServer(null);
                go("serverBrowser");
                break;
            case "start":
                go("char");
                setChars([]);
                setRotation([]);
                break;
            default:
                go("startMenu");
        }
    };

    const joinGame = async (chosenChar) => {
        try {
            await joinOnlineGame(accessToken, chosenChar, selectedServer.gameId);
            onStart({
                mode: "online",
                gameId: selectedServer.gameId,
                character: chosenChar,
                gameName: selectedServer.gameName
            });
            go("game");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <main className="game-menu-container">
            <div
                className={`hamburger-icon ${isMenuOpen ? "open" : ""}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            <nav className={`side-menu ${isMenuOpen ? "active" : ""}`}>
                <ul className="menu-list">
                    <li
                        onClick={() => {
                            play("click");
                            go("profile");
                            setIsMenuOpen(false);
                        }}
                    >
                        <i className="icon-user"></i> PROFILE
                    </li>
                    <li
                        onClick={() => {
                            play("click");
                            go("chat");
                            setIsMenuOpen(false);
                        }}
                    >
                        <i className="icon-chat"></i> CHAT
                    </li>
                    <li
                        className="logout-item"
                        onClick={() => {
                            play("click");
                            localStorage.removeItem("userName");
                            window.location.reload();
                        }}
                    >
                        <i className="icon-logout"></i> LOGOUT
                    </li>
                </ul>
            </nav>

            {isMenuOpen && (
                <div
                    className="menu-overlay"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {menuStep === "startMenu" && (
                <div className="play-container">
                    <button
                        className="bigPlayButton"
                        onMouseOver={() => play("hover")}
                        onClick={() => {
                            play("click");
                            go("mode");
                        }}
                    >
                        PLAY
                    </button>
                </div>
            )}
            {menuStep === "mode" && (
                <div className="menu-step-content">
                    <h2 className={`helptext ${entering ? "outBelow" : ""}`}>
                        CHOOSE GAME MODE!
                    </h2>
                    <div className="menu-layout">
                        <button
                            className="game-btn"
                            onMouseOver={() => play("hover")}
                            onClick={() => {
                                play("click");
                                setMode("pve");
                                go("pveDiff");
                            }}
                        >
                            SINGLE PLAYER{"\n"}(vs CPU)
                        </button>
                        <button
                            className="game-btn"
                            onMouseOver={() => play("hover")}
                            onClick={() => {
                                play("click");
                                go("multiType");
                            }}
                        >
                            MULTIPLAYER{"\n"}(LAN/Online)
                        </button>
                    </div>
                </div>
            )}

            {menuStep !== "startMenu" && menuStep !== "leaving" && menuStep !== "profile" &&(
                <button className="back-button-modern" onClick={back}>
                    <span className="arrow-icon">←</span>
                </button>
            )}

            {menuStep === "multiType" && (
                <div className="menu-step-content">
                    <h2 className="helptext">MULTIPLAYER TYPE</h2>
                    <div className="menu-layout">
                        <button
                            className="game-btn"
                            onClick={() => {
                                play("click");
                                setMode("pvp");
                                go("pvpCount");
                            }}
                        >
                            LAN{"\n"}(Local)
                        </button>
                        <button
                            className="game-btn"
                            onClick={() => {
                                play("click");
                                go("onlineType");
                            }}
                        >
                            ONLINE{"\n"}(Network)
                        </button>
                    </div>
                </div>
            )}

            {menuStep === "onlineType" && (
                <div className="meut-step-content">
                    <h2 className="helptext">ONLINE MATCHMAKING</h2>
                    <div className="menu-layout online-grid">
                        <button
                            className="game-btn"
                            onClick={() => {
                                play("click");
                                setMode("online");
                                setOnlineType("quick");
                                setPlayerCount(2);
                                go("quick-match");
                            }}
                        >
                            QUICK{"\n"}MATCH
                        </button>
                        <button
                            className="game-btn"
                            onClick={() => {
                                play("click");
                                setMode("online");
                                setOnlineType("browser");
                                go("serverBrowser");
                            }}
                        >
                            SERVER{"\n"}BROWSER
                        </button>
                        <button
                            className="game-btn"
                            onClick={() => {
                                play("click");
                                setMode("online");
                                setOnlineType("create");
                                go("createGame");
                            }}
                        >
                            CREATE {"\n"} NEW GAME
                        </button>
                        <button
                            className="game-btn"
                            onClick={() => {
                                play("click");
                                setMode("online");
                                go("onlineLoadList");
                            }}
                        >
                            LOAD {"\n"} GAME
                        </button>
                    </div>
                </div>
            )}

      {menuStep === "pvpCount" && (
        <div className="menu-step-content">
          <h2 className="helptext">HOW MANY PLAYERS?</h2>
          <div className="menu-layout">
            <button
              className="game-btn"
              onClick={() => {
                setPlayerCount(2);
                go("char");
              }}
            >
              TWO PLAYER
            </button>
            <button
              className="game-btn"
              onClick={() => {
                setPlayerCount(3);
                go("char");
              }}
            >
              THREE PLAYER
            </button>
          </div>
        </div>
      )}
      {menuStep === "createGame" && (
        <CreateGame
          onContinue={(gameId, gameName) => {
            play("click");
            setCurrentGameId(gameId);
            onStart({
              mode: "online",
              gameId: gameId,
              creator: userName,
              gameName: gameName
            });
            go("game");
          }}
        />
      )}

            {menuStep === "serverBrowser" && (
                <ServerBrowser
                    onJoin={(game) => {
                        play("click");
                        setCurrentGameId(game.gameId);
                        setSelectedServer(game);
                        setSelectedOnlineChar(null);
                        go("onlineJoinChar");
                    }}
                />
            )}

            {menuStep === "onlineJoinChar" && selectedServer && (
                <div className="menu-step-container">
                    <h2 className="helptext">
                        {availableOnlineChars.length === 1
                            ? "YOUR CHARACTER"
                            : "CHOOSE YOUR CHARACTER"}
                    </h2>

                    <div className="char-grid">
                        {availableOnlineChars.length > 1 ? (
                            availableOnlineChars.map((ch) => (
                                <button
                                    key={ch}
                                    className={`charChoice ${selectedOnlineChar === ch ? "active-starter" : ""}`}
                                    onMouseOver={() => play("hover")}
                                    onClick={() => {
                                        play("click");
                                        setSelectedOnlineChar(ch);
                                    }}
                                >
                                    {ch}
                                </button>
                            ))
                        ) : (
                            <div className="single-char-display">
                <span className="charChoice active-starter">
                  {availableOnlineChars[0]}
                </span>
                            </div>
                        )}
                    </div>

                    <div className="start-action-wrapper" style={{marginTop: "30px"}}>
                        <button
                            className="bigPlayButton"
                            onClick={async () => {
                                const taken = selectedServer.characters || [];
                                const available = CHARSET.filter((ch) => !taken.includes(ch));
                                if (available.length === 0) return;

                                const chosenChar =
                                    available.length === 1 ? available[0] : selectedOnlineChar;
                                if (!chosenChar) return;

                                joinGame(chosenChar);
                            }}
                            disabled={
                                availableOnlineChars.length === 0 ||
                                (availableOnlineChars.length > 1 && !selectedOnlineChar)
                            }
                        >
                            JOIN GAME
                        </button>
                    </div>
                </div>
            )}

      {menuStep === "onlineLoadList" && (
        <OnlineLoadList
          currentUserId={localStorage.getItem("userName")}
          onSelect={(game) => {
            play("click");
            setCurrentGameId(game.gameId);
            onStart({
              ...game,
              mode: "online",
            });
            go("game");
          }}
          onStartGame={async (game) => {
            play("click");
            try {
                            await startOnlineGame(accessToken, game.gameId);
            } catch (error) {
              console.log("Can't start online game: " + error);
            }
            setCurrentGameId(game.gameId);
            onStart({
              ...game,
              mode: "online",
            });
            go("game");
          }}
        />
      )}

            {menuStep === "pveDiff" && (
                <div className="menu-step-content">
                    <h2 className={`helptext ${entering ? "outBelow" : ""}`}>
                        HOW ADEPT SHOULD THE AI BE?
                    </h2>
                    <div className="difficulty-container">
                        {["easy", "medium", "hard", "unbeatable"].map((d, i) => (
                            <button
                                key={d}
                                className={`game-btn diff-btn ${d === difficulty ? "active" : ""}`}
                                onClick={() => {
                                    play("click");
                                    setDifficulty(d);
                                    go("char");
                                }}
                            >
                                {d.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {menuStep === "char" && (
                <div className="menu-step-container">
                    <h2 className="helptext">
                        {mode === "pve" && chars.length === 0
                            ? "PICK YOUR TOKEN!"
                            : mode === "pve" && chars.length === 1
                                ? "PICK THE CPU'S TOKEN!"
                                : `PLAYER ${chars.length + 1} PICK!`}
                    </h2>

                    <div className="char-grid">
                        {CHARSET.filter((ch) => !chars.includes(ch)).map((ch) => (
                            <button
                                key={ch}
                                className="charChoice"
                                onMouseOver={() => play("hover")}
                                onClick={() => {
                                    play("click");
                                    const newChars = [...chars, ch];
                                    setChars(newChars);

                                    if (newChars.length === playerCount) {
                                        go("start");
                                    }
                                }}
                            >
                                {ch}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {menuStep === "start" && (
                <div className="start-confirm-area">
                    <h2 className="helptext">WHO STARTS THE GAME?</h2>

                    <div className="char-grid">
                        {chars.map((ch) => (
                            <button
                                key={ch}
                                className={`charChoice ${rotation[0] === ch ? "active-starter" : ""}`}
                                onClick={() => {
                                    play("click");
                                    const others = chars.filter((c) => c !== ch);
                                    setRotation([ch, ...others]);
                                }}
                            >
                                {ch}
                            </button>
                        ))}
                    </div>

                    {rotation.length > 0 && (
                        <div className="start-action-wrapper" style={{marginTop: "30px"}}>
                            <button className="bigPlayButton" onClick={startGame}>
                                START GAME
                            </button>
                        </div>
                    )}
                </div>
            )}
            {menuStep === "profile" && (
                <Profile onBack={() => go("startMenu")} />
            )}

            {menuStep === "game" && (
                <button
                    className="game-exit-button"
                    style={{
                        zIndex: 10000,
                        position: "fixed",
                        display: "block",
                        visibility: "visible",
                        opacity: 1,
                    }}
                    onClick={() => {
                        play("click");
                        setChars([]);
                        setRotation([]);
                        setMode(null);
                        go("startMenu");
                    }}
                >
                    QUIT TO MENU
                </button>
            )}
        </main>
    );
}
