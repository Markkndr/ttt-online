import {useState} from "react";
import {useAudio} from "../hooks/useAudio";
import {api} from "../state/config";
import '../StyleCSS/auth.css'
import { useAuth } from "../state/AuthContext";
import { useUser } from "../state/UserContext";
import { useWebSocket } from "../state/WebSocketContext";

export default function Register({className = "", style, onBack, onSubmit}) {
    const {play} = useAudio();
    const { setAccessToken } = useAuth();
    const { refreshUser } = useUser();
    const { connect } = useWebSocket();
    const emptyData = {
        ["birth-date"]: "",
        username: "",
        email: "",
        password: ""
    };
    const [data, setData] = useState(emptyData);

    function handleChange(event) {
        play('type');
        const {name, value} = event.target;
        if (name === 'confirm') return;
        setData((prev) => ({...prev, [name]: value}));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (
            !data.username ||
            !data.email ||
            !data.password ||
            !data["birth-date"]
        ) {
            alert("Please fill all fields");
            return;
        }

        const formData = new FormData(e.target);
        const confirm = formData.get('confirm') || '';
        if (data.password !== confirm) {
            alert("Passwords do not match");
            return;
        }

        try {
            const resp = await fetch(api(`/api/auth/register`), {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    birthDate: data["birth-date"],
                }),
            });
            if (resp.ok) {
                let jwt = null;
                try {
                    const body = await resp.json();
                    jwt = body?.accessToken || body?.token || null;
                } catch (e) {
                    // backend might not return a body; ignore
                }

                if (jwt) {
                    localStorage.setItem("userName", data.username);
                    setAccessToken(jwt);
                    await refreshUser();
                    connect(jwt);
                }

                alert("Registration successful");
                onSubmit && onSubmit({username: data.username, email: data.email});
            } else {
                const msg = await resp.text().catch(() => "");
                alert(`Registration failed (${resp.status}). ${msg || ""}`);
            }
        } catch (err) {
            alert("Network error during registration");
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h2 className="helptext">JOIN TO TTT</h2>
                <div className={["register-container", className].join(" ").trim()} style={style}>
                    {Object.entries(emptyData).map(([key]) => (
                        <div key={key} className="form-group">
                            <label className="form-label" htmlFor={key}>
                                {key}:
                            </label>
                            <input
                                className="form-input"
                                name={key}
                                onChange={handleChange}
                                type={
                                    key === "password" ? "password"
                                        : key === "email" ? "email"
                                            : key.includes("date") ? "date"
                                                : "text"
                                }
                                placeholder=""
                                defaultValue={key === "birth-date" ? "2000-01-01" : data[key]}
                            />
                        </div>
                    ))}
                    <div className="form-group">
                        <label className="form-label" htmlFor={"confirm"}>
                            confirm password:
                        </label>
                        <input
                            className="form-input"
                            name={"confirm"}
                            onChange={handleChange}
                            type={"password"}
                            placeholder=""
                        />
                    </div>
                    <div className="auth-actions">
                        <button className="base-btn btn-primary" type="submit">
                            Create Account
                        </button>
                        <button
                            className="base-btn btn-ghost"
                            type="button"
                            onClick={() => onBack && onBack()}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
