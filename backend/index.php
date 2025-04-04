<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deep Dive Packs</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
</head>
<body>
<div id="root"></div>

<script type="text/babel">
    function Auth() {
        const [username, setUsername] = React.useState("");
        const [password, setPassword] = React.useState("");
        const [message, setMessage] = React.useState("");

        function handleRegister() {
            fetch("http://localhost:8000/endpoints/register.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })
                .then(res => res.json())
                .then(data => setMessage(data.message || data.error));
        }

        function handleLogin() {
            fetch("http://localhost:8000/endpoints/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user_id) {
                        localStorage.setItem("user_id", data.user_id);
                        setMessage("Login succesvol!");
                    } else {
                        setMessage(data.error);
                    }
                });
        }

        return (
            <div>
                <h2>Login/Register</h2>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleRegister}>Register</button>
                <button onClick={handleLogin}>Login</button>
                <p>{message}</p>
            </div>
        );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<Auth />);
</script>
</script>
</body>
</html>
