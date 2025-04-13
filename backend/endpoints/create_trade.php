<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

require_once("../config/database.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$user_id = $data->user_id;
$offering_card_id = $data->offering_card_id;
$wanting_card_id = $data->wanting_card_id;

try {
    // Verify the user owns the card they're offering
    $verify_stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM collections 
        WHERE user_id = ? AND card_id = ?
    ");
    $verify_stmt->execute([$user_id, $offering_card_id]);
    $result = $verify_stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['count'] == 0) {
        http_response_code(400);
        echo json_encode(['error' => 'You do not own this card']);
        exit;
    }

    // Create the trade offer
    $stmt = $pdo->prepare("
        INSERT INTO trades (
            offering_user_id, 
            offering_card_id, 
            wanting_card_id, 
            status, 
            created_at
        ) VALUES (?, ?, ?, 'pending', NOW())
    ");
    
    $stmt->execute([
        $user_id,
        $offering_card_id,
        $wanting_card_id
    ]);

    echo json_encode([
        'success' => true,
        'trade_id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to create trade',
        'message' => $e->getMessage()
    ]);
}
?> 