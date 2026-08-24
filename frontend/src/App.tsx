import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    if (!isLoggedIn) {
        return (
            <Login
                onLogin={() => setIsLoggedIn(true)}
            />
        );
    }

    return (
        <Dashboard
            onLogout={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setIsLoggedIn(false);
            }}
        />
    );
}

export default App;