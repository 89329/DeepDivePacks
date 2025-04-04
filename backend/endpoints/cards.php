<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Database verbinden
require_once("../config/database.php");

try {
    $stmt = $pdo->query("SELECT * FROM cards");
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Voeg de volledige afbeeldings-URL toe
    foreach ($cards as &$card) {
        $card['image_url'] = "../public/images/" . $card['image_url'];
    }

    echo json_encode($cards);
} catch (PDOException $e) {
    echo json_encode(["error" => "Databasefout: " . $e->getMessage()]);
}
?>
