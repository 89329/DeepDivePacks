<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../config/database.php");

$user_id = $_GET['user_id'];

try {
    $stmt = $pdo->prepare("SELECT cards.* FROM collections 
                           JOIN cards ON collections.card_id = cards.id 
                           WHERE collections.user_id = ?");
    $stmt->execute([$user_id]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($cards);
} catch (PDOException $e) {
    echo json_encode(["error" => "Fout bij ophalen van collectie."]);
}
?>
