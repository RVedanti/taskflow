import { useState } from "react";
import api from "./services/api";

interface LoginProps {
    onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        const loginEmail = email.trim().toLowerCase();

        console.log("LOGIN EMAIL:", loginEmail);
        console.log("LOGIN PASSWORD LENGTH:", password.length);

        try {

            const response = await api.post("/auth/login", {
                email: loginEmail,
                password: password
            });

            console.log("LOGIN RESPONSE:", response.data);

            const token = response.data.token;
            const user = response.data.user;

            if (!token) {
                throw new Error("No token received from server");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            console.log(
                "TOKEN SAVED:",
                localStorage.getItem("token")
            );

            onLogin();

        } catch (error: any) {

            console.error(
                "LOGIN ERROR:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Login failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-logo">
                    ⚡ TaskFlow
                </div>

                <h1>Welcome Back</h1>

                <p className="login-subtitle">
                    Login to your TaskFlow dashboard
                </p>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;