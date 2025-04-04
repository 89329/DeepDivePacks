<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../config/database.php");

$user_id = $_POST['user_id'];
$random_card_id = rand(1, 10); // Simpel voorbeeld: random kaart uit 10

try {
    $stmt = $pdo->prepare("INSERT INTO collections (user_id, card_id) VALUES (?, ?)");
    $stmt->execute([$user_id, $random_card_id]);

    echo json_encode(["message" => "Kaart toegevoegd!"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Fout bij openen pack."]);
}
?>
