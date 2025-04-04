<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../config/database.php");

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute([$username, $password]);

    echo json_encode(["message" => "Registratie succesvol!"]);
} catch (PDOException $e) {
    echo json_encode(["error" => "Gebruikersnaam bestaat al!"]);
}
?>
