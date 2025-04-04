<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../config/database.php");

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'];
$password = $data['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    echo json_encode(["message" => "Login succesvol!", "user_id" => $user['id']]);
} else {
    echo json_encode(["error" => "Ongeldige inloggegevens!"]);
}
?>
