import {useState} from "react";
import {api} from "../../state/config";
import {useNotifications} from "../../state/NotificationContext";
import {useWebSocket} from "../../state/WebSocketContext";
import '../../StyleCSS/auth.css'
import '../../StyleCSS/global.css'
import {useUser} from "../../state/UserContext";
import { useAuth } from "../../state/AuthContext";

function Login({className = "", style, onSubmit, onRegister}) {
    const {connect, subscribe} = useWebSocket();
    const {addNotification} = useNotifications();
    const {refreshUser} = useUser();
    const { setAccessToken } = useAuth();

    const emptyData = {
        username: "",
        password: "",
    };
    const [data, setData] = useState(emptyData);

    function handleChange(event) {

        let newData = {};
        if (event.target.dataset.index) {
            newData = {
                ...data,
            };

            newData[event.target.dataset.key].splice(
                event.target.dataset.index,
                1,
                event.target.value,
            );

            setData(newData);
        } else {
            newData = {
                ...data,
                [event.target.name]: event.target.value,
            };
            setData(newData);
        }
        // console.log(newData);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!data.username || !data.password) {
            alert("Please enter username and password");
            return;
        }

        // with POST:
        try {
            const resp = await fetch(api(`/api/auth/login`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (resp.ok) {
                const body = await resp.json();
                const jwt = body.accessToken || body.token;

                if (!jwt) {
                    console.error("error: Backend didnt send a token!", body);
                    return;
                }


                localStorage.setItem("userName", data.username);

                setAccessToken(jwt);
                await refreshUser();
                connect(jwt);

                // subscribe(`/user/${jwt}/notifications`, (msg) => {
                //   const body = JSON.parse(msg.body);
                //   addNotification(body);
                // });

                setTimeout(() => {
                    onSubmit && onSubmit(data);
                }, 100);
            } else {
                const msg = await resp.text().catch(() => "");
                alert(`Failed to log in (${resp.status}). ${msg || ""}`);
            }
        } catch (err) {
            alert("Network error during login: " + err);
        }
    }

    return (
        <div className={`auth-page ${className}`} style={style}>
            {/* <h2 className="helptext">Welcome</h2> */}

            <form className="auth-card" onSubmit={handleSubmit}>

                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        className="form-input"
                        name="username"
                        type="text"
                        value={data.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        className="form-input"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="auth-actions">
                    <button className="base-btn btn-ghost" type="submit">
                        Login
                    </button>
                    <button
                        className="base-btn btn-ghost"
                        type="button"
                        onClick={onRegister}
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    );

}

export default Login;
