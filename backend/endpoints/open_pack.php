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
$collection_id = $data->collection_id;

try {
    // Start transaction
    $pdo->beginTransaction();

    // Get 3 random cards from the specified collection
    $stmt = $pdo->prepare("
        SELECT id, name, rarity, image 
        FROM cards 
        WHERE collection_id = ? 
        ORDER BY RAND() 
        LIMIT 3
    ");
    $stmt->execute([$collection_id]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add cards to user's collection
    $insert_stmt = $pdo->prepare("
        INSERT INTO collections (user_id, card_id, obtained_date) 
        VALUES (?, ?, NOW())
    ");

    foreach ($cards as $card) {
        $insert_stmt->execute([$user_id, $card['id']]);
    }

    // Commit transaction
    $pdo->commit();

    // Return the cards that were obtained
    echo json_encode([
        'success' => true,
        'cards' => $cards
    ]);

} catch (PDOException $e) {
    // Rollback on error
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to open pack',
        'message' => $e->getMessage()
    ]);
}
?>
