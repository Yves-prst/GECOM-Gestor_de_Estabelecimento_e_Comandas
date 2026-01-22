<?php
require_once '../config/database.php';
require_once '../config/auth.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $month = date('n');
        $year = date('Y');
        
        $stmt = $pdo->prepare("SELECT id FROM goals WHERE month = ? AND year = ?");
        $stmt->execute([$month, $year]);
        
        if ($stmt->fetch()) {
            $stmt = $pdo->prepare("UPDATE goals SET target = ? WHERE month = ? AND year = ?");
            $stmt->execute([$data['target'], $month, $year]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO goals (target, month, year) VALUES (?, ?, ?)");
            $stmt->execute([$data['target'], $month, $year]);
        }
        
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
