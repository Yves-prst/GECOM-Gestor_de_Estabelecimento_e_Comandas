<?php
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $order_id = intval($_POST['order_id'] ?? 0);
    
    // ✅ Verificar ações válidas
    if (!$order_id || !in_array($action, ['start_preparing', 'mark_ready'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Verificar se o pedido existe
        $check_sql = "SELECT id, status FROM orders WHERE id = ?";
        $check_stmt = $pdo->prepare($check_sql);
        $check_stmt->execute([$order_id]);
        $order = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            throw new Exception('Pedido não encontrado');
        }
        
        // ✅ Atualizar status conforme ação
        if ($action === 'start_preparing') {
            $new_status = 'preparing';
            $message = 'Pedido em preparação';
        } else if ($action === 'mark_ready') {
            $new_status = 'ready';
            $message = 'Pedido pronto para entrega';
        }
        
        $update_sql = "UPDATE orders SET status = ? WHERE id = ?";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([$new_status, $order_id]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => $message,
            'new_status' => $new_status
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}
?>