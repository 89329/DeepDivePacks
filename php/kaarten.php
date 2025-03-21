<?php
include 'config.php';
// Ophalen van de gegevens uit de 'kaarten' tabel
$sql = "SELECT * FROM kaarten";
$result = $conn->query($sql);

// Controleer of er resultaten zijn
if ($result->num_rows > 0) {
    // Toon de gegevens voor elke kaart
    while($row = $result->fetch_assoc()) {
        echo "<div class='card'>";
        echo "<img src='" . $row['afbeelding_url'] . "' alt='" . $row['naam'] . "' class='card-image'>";
        echo "<div class='card-info'>";
        echo "<h2 class='card-name'>" . $row['naam'] . "</h2>";
        echo "<p class='card-description'>" . $row['beschrijving'] . "</p>";
        echo "<ul class='card-stats'>";
        echo "<li><strong>Leefgebied:</strong> " . $row['leefgebied'] . "</li>";
        echo "<li><strong>Dieet:</strong> " . $row['dieet'] . "</li>";
        echo "<li><strong>Grootte:</strong> " . $row['grootte'] . "</li>";
        echo "</ul>";
        echo "</div></div>";
    }
} else {
    echo "Geen kaarten gevonden!";
}

$conn->close();
?>
