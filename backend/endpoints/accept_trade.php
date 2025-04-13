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
$trade_id = $data->trade_id;
$accepting_user_id = $data->user_id;

try {
    $pdo->beginTransaction();

    // Get trade details
    $trade_stmt = $pdo->prepare("
        SELECT * FROM trades 
        WHERE id = ? AND status = 'pending'
    ");
    $trade_stmt->execute([$trade_id]);
    $trade = $trade_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$trade) {
        throw new Exception('Trade not found or already completed');
    }

    // Verify the accepting user owns the wanted card
    $verify_stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM collections 
        WHERE user_id = ? AND card_id = ?
    ");
    $verify_stmt->execute([$accepting_user_id, $trade['wanting_card_id']]);
    $result = $verify_stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['count'] == 0) {
        throw new Exception('You do not own the requested card');
    }

    // Remove cards from current owners
    $remove_stmt = $pdo->prepare("
        DELETE FROM collections 
        WHERE (user_id = ? AND card_id = ?) 
        OR (user_id = ? AND card_id = ?)
    ");
    $remove_stmt->execute([
        $trade['offering_user_id'],
        $trade['offering_card_id'],
        $accepting_user_id,
        $trade['wanting_card_id']
    ]);

    // Add cards to new owners
    $add_stmt = $pdo->prepare("
        INSERT INTO collections (user_id, card_id, obtained_date) 
        VALUES (?, ?, NOW()), (?, ?, NOW())
    ");
    $add_stmt->execute([
        $accepting_user_id,
        $trade['offering_card_id'],
        $trade['offering_user_id'],
        $trade['wanting_card_id']
    ]);

    // Update trade status
    $update_stmt = $pdo->prepare("
        UPDATE trades 
        SET status = 'completed', 
            completed_at = NOW(), 
            accepting_user_id = ? 
        WHERE id = ?
    ");
    $update_stmt->execute([$accepting_user_id, $trade_id]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Trade completed successfully'
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to complete trade',
        'message' => $e->getMessage()
    ]);
}
?> 