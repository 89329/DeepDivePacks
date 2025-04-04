
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Collectie</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
    function Collection() {
        const [cards, setCards] = React.useState([]);
        const userId = localStorage.getItem("user_id");

        React.useEffect(() => {
            fetch(`http://localhost:8000/endpoints/user_collection.php?user_id=${userId}`)
                .then(response => response.json())
                .then(data => setCards(data))
                .catch(error => console.error("Fout bij ophalen collectie:", error));
        }, []);

        return (
            <div>
                <h1>📦 Mijn Collectie</h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {cards.map(card => (
                        <div key={card.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
                            <h3>{card.naam}</h3>
                            <img src={`http://localhost:8000/public/${card.afbeelding}`} alt={card.naam} width="150px" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<Collection />);
</script>

</body>
</html>