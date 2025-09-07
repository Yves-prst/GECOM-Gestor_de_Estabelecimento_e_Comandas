<?php
require_once '../config/database.php';
require_once '../config/auth.php';

if (!isLoggedIn()) {
    header('Location: ../index.php');
    exit();
}

$period = $_GET['period'] ?? 'week';

if ($period === 'week') {
    $startDate = date('Y-m-d', strtotime('monday this week'));
    $endDate = date('Y-m-d', strtotime('sunday this week'));
    $title = 'Relatório Semanal de Vendas';
} else {
    $startDate = date('Y-m-01');
    $endDate = date('Y-m-t');
    $title = 'Relatório Mensal de Vendas';
}

$stmt = $pdo->prepare("
    SELECT 
        product_name as product,
        SUM(quantity) as quantity,
        SUM(total_price) as total
    FROM sales 
    WHERE DATE(sale_date) BETWEEN ? AND ?
    GROUP BY product_name
    ORDER BY total DESC
");
$stmt->execute([$startDate, $endDate]);
$data = $stmt->fetchAll();

$totalQuantity = array_sum(array_column($data, 'quantity'));
$totalRevenue = array_sum(array_column($data, 'total'));

header('Content-Type: text/html; charset=utf-8');
header('Content-Disposition: attachment; filename="relatorio-' . $period . '-' . date('Y-m-d') . '.html"');

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title><?php echo $title; ?></title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .info { text-align: center; margin-bottom: 30px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .total-row { background-color: #f9f9f9; font-weight: bold; }
        .summary { margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-radius: 5px; }
        .summary h3 { margin-top: 0; color: #333; }
    </style>
</head>
<body>
    <h1><?php echo $title; ?></h1>
    <div class="info">
        <p>Período: <?php echo date('d/m/Y', strtotime($startDate)); ?> a <?php echo date('d/m/Y', strtotime($endDate)); ?></p>
        <p>Gerado em: <?php echo date('d/m/Y H:i:s'); ?></p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Total (R$)</th>
                <th>Participação (%)</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($data as $item): ?>
                <tr>
                    <td><?php echo htmlspecialchars($item['product']); ?></td>
                    <td><?php echo $item['quantity']; ?></td>
                    <td>R$ <?php echo number_format($item['total'], 2, ',', '.'); ?></td>
                    <td><?php echo number_format(($item['total'] / $totalRevenue) * 100, 1, ',', '.'); ?>%</td>
                </tr>
            <?php endforeach; ?>
            <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                <td><strong><?php echo $totalQuantity; ?></strong></td>
                <td><strong>R$ <?php echo number_format($totalRevenue, 2, ',', '.'); ?></strong></td>
                <td><strong>100,0%</strong></td>
            </tr>
        </tbody>
    </table>
    
    <div class="summary">
        <h3>Resumo do Período</h3>
        <p><strong>Total de produtos diferentes:</strong> <?php echo count($data); ?></p>
        <p><strong>Total de itens vendidos:</strong> <?php echo $totalQuantity; ?></p>
        <p><strong>Receita total:</strong> R$ <?php echo number_format($totalRevenue, 2, ',', '.'); ?></p>
        <p><strong>Produto mais vendido:</strong> <?php echo $data[0]['product'] ?? 'N/A'; ?></p>
        <p><strong>Ticket médio:</strong> R$ <?php echo $totalQuantity > 0 ? number_format($totalRevenue / $totalQuantity, 2, ',', '.') : '0,00'; ?></p>
    </div>
</body>
</html>
