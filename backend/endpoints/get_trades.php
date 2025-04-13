<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../config/database.php");

try {
    // Get all pending trades with card and user details
    $stmt = $pdo->prepare("
        SELECT 
            t.id,
            t.offering_user_id,
            t.offering_card_id,
            t.wanting_card_id,
            t.created_at,
            u.username as user,
            oc.name as offering_name,
            oc.rarity as offering_rarity,
            oc.image as offering_image,
            wc.name as wanting_name,
            wc.rarity as wanting_rarity,
            wc.image as wanting_image
        FROM trades t
        JOIN users u ON t.offering_user_id = u.id
        JOIN cards oc ON t.offering_card_id = oc.id
        JOIN cards wc ON t.wanting_card_id = wc.id
        WHERE t.status = 'pending'
        ORDER BY t.created_at DESC
    ");
    
    $stmt->execute();
    $trades = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the trades for the frontend
    $formatted_trades = array_map(function($trade) {
        return [
            'id' => $trade['id'],
            'user' => $trade['user'],
            'offering' => [
                'id' => $trade['offering_card_id'],
                'name' => $trade['offering_name'],
                'rarity' => $trade['offering_rarity'],
                'image' => $trade['offering_image']
            ],
            'wanting' => [
                'id' => $trade['wanting_card_id'],
                'name' => $trade['wanting_name'],
                'rarity' => $trade['wanting_rarity'],
                'image' => $trade['wanting_image']
            ],
            'created_at' => $trade['created_at']
        ];
    }, $trades);

    echo json_encode([
        'success' => true,
        'trades' => $formatted_trades
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch trades',
        'message' => $e->getMessage()
    ]);
}
?> 