<?php
require_once 'db_config.php';

// Buscar pedidos para a cozinha (incluindo 'ready')
$sql = "
    SELECT 
        o.id, 
        o.status, 
        o.total, 
        o.created_at,
        GROUP_CONCAT(DISTINCT m.numero) as mesas
    FROM orders o
    LEFT JOIN mesa_orders mo ON o.id = mo.order_id
    LEFT JOIN mesas m ON mo.mesa_id = m.id
    WHERE o.status IN ('sent_to_kitchen', 'preparing', 'ready')
    GROUP BY o.id
    ORDER BY 
        CASE 
            WHEN o.status = 'sent_to_kitchen' THEN 1
            WHEN o.status = 'preparing' THEN 2
            WHEN o.status = 'ready' THEN 3
        END,
        o.created_at ASC
";

$stmt = $pdo->prepare($sql);
$stmt->execute();
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Para cada pedido, buscar itens
foreach ($orders as &$order) {
    $items_sql = "
        SELECT 
            oi.id,
            oi.product_name,
            oi.quantity,
            oi.notes,
            GROUP_CONCAT(CONCAT(ca.name, ' (+R$', ca.price, ')') SEPARATOR ', ') as addons
        FROM order_items oi
        LEFT JOIN order_item_addons oia ON oi.id = oia.order_item_id
        LEFT JOIN category_addons ca ON oia.addon_id = ca.id
        WHERE oi.order_id = ?
        GROUP BY oi.id
    ";
    
    $items_stmt = $pdo->prepare($items_sql);
    $items_stmt->execute([$order['id']]);
    $order['items'] = $items_stmt->fetchAll(PDO::FETCH_ASSOC);
}

header('Content-Type: application/json');
echo json_encode($orders);
?>