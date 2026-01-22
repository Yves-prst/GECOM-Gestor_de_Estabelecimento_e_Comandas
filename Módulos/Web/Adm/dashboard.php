<?php
require_once 'config/database.php';
require_once 'config/auth.php';
requireLogin();

// Fuso horário correto
date_default_timezone_set('America/Sao_Paulo');

$today = date('Y-m-d');
$startDay = $today . " 00:00:00";
$endDay   = $today . " 23:59:59";

/* ================================
   TOTAL VENDIDO HOJE (CORRIGIDO)
================================ */
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(total_price), 0) 
    FROM sales 
    WHERE sale_date BETWEEN ? AND ?
");
$stmt->execute([$startDay, $endDay]);
$totalToday = $stmt->fetchColumn();

/* ================================
   COMANDAS ABERTAS (CORRIGIDO)
   Conta tudo que NÃO está 'closed'
================================ */
$stmt = $pdo->query("
    SELECT COUNT(*) 
    FROM orders 
    WHERE status != 'closed'
");
$openOrders = $stmt->fetchColumn();

/* ================================
   COMANDAS FECHADAS HOJE
================================ */
$stmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM orders 
    WHERE status = 'closed'
    AND closed_at BETWEEN ? AND ?
");
$stmt->execute([$startDay, $endDay]);
$closedOrders = $stmt->fetchColumn();

/* ================================
   META MENSAL
================================ */
$currentMonth = date('n');
$currentYear = date('Y');

$stmt = $pdo->prepare("
    SELECT * 
    FROM goals 
    WHERE month = ? AND year = ?
");
$stmt->execute([$currentMonth, $currentYear]);
$goal = $stmt->fetch();

/* ================================
   TOTAL DO MÊS (CORRIGIDO)
================================ */
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(total_price), 0) 
    FROM sales 
    WHERE MONTH(sale_date) = ? 
    AND YEAR(sale_date) = ?
");
$stmt->execute([$currentMonth, $currentYear]);
$currentSales = $stmt->fetchColumn();

/* ================================
   PRODUTOS RECENTES
================================ */
$stmt = $pdo->query("
    SELECT p.*, c.name AS category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
    LIMIT 5
");
$recentProducts = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema Administrativo</title>
    <link rel="stylesheet" href="assets/css/style.css?v=1.2">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>

<body>
    <?php include 'includes/sidebar.php'; ?>

    <button class="mobile-menu-toggle" onclick="toggleSidebar()" 
        style="margin:5px; height:20px; position:absolute;">
        <i class="fas fa-bars"></i>
    </button>

    <div class="main-content">

        <div class="header">
            <h1>Dashboard</h1>
            <div class="user-info">
                Bem-vindo, <?php echo htmlspecialchars($_SESSION['username']); ?>
            </div>
        </div>

        <div class="stats-grid">

            <!-- TOTAL VENDIDO HOJE -->
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-dollar-sign" style="color:white;"></i></div>
                <div class="stat-content">
                    <h3>Total Vendido Hoje</h3>
                    <div class="stat-value">
                        <span id="totalValue">
                            R$ <?php echo number_format($totalToday, 2, ',', '.'); ?>
                        </span>
                        <button onclick="toggleValue()" class="toggle-btn">
                            <i class="fas fa-eye" id="eyeIcon"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- COMANDAS ABERTAS -->
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clock" style="color:white;"></i></div>
                <div class="stat-content">
                    <h3>Comandas Abertas</h3>
                    <div class="stat-value"><?php echo $openOrders; ?></div>
                </div>
            </div>

            <!-- COMANDAS FECHADAS -->
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-check-circle" style="color:white;"></i></div>
                <div class="stat-content">
                    <h3>Comandas Fechadas</h3>
                    <div class="stat-value"><?php echo $closedOrders; ?></div>
                </div>
            </div>

        </div>

        <!-- META MENSAL -->
        <div class="content-grid">
            <div class="card">

                <div class="card-header">
                    <h2>Meta Mensal de Vendas</h2>
                    <button class="btn btn-primary" onclick="openGoalModal()">Definir Meta</button>
                </div>

                <div class="card-content">
                    <?php if ($goal): ?>
                        <div class="goal-info">

                            <div class="goal-values">
                                R$ <?php echo number_format($currentSales, 2, ',', '.'); ?> /
                                R$ <?php echo number_format($goal['target'], 2, ',', '.'); ?>
                            </div>

                            <div class="progress-bar">
                                <?php 
                                    $percentage = $goal['target'] > 0 
                                        ? min(($currentSales / $goal['target']) * 100, 100)
                                        : 0;
                                ?>
                                <div class="progress-fill" style="width: <?php echo $percentage; ?>%">
                                    <?php echo number_format($percentage, 1); ?>%
                                </div>
                            </div>

                        </div>
                    <?php else: ?>
                        <p class="no-goal">Nenhuma meta definida para este mês</p>
                    <?php endif; ?>
                </div>

            </div>
        </div>

        <!-- PRODUTOS RECENTES -->
        <div class="card">

            <div class="card-header">
                <h2>Produtos Recentes</h2>
                <a href="produtos.php" class="btn btn-secondary">Ver Todos</a>
            </div>

            <div class="card-content">
                <div class="table-responsive">

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Preço</th>
                                <th>Status</th>
                                <th>Categoria</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            <?php foreach ($recentProducts as $product): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($product['name']); ?></td>
                                <td>R$ <?php echo number_format($product['price'], 2, ',', '.'); ?></td>
                                <td>
                                    <span class="badge badge-<?php echo $product['status'] === 'Ativo' ? 'success' : 'secondary'; ?>">
                                        <?php echo $product['status']; ?>
                                    </span>
                                </td>
                                <td><?php echo $product['category_name'] ?? 'Sem categoria'; ?></td>
                                <td>
                                    <a href="produtos.php?edit=<?php echo $product['id']; ?>" class="btn-icon">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>

                    </table>
                </div>
            </div>

        </div>

        <!-- MODAL META -->
        <div id="goalModal" class="modal">
            <div class="modal-content">

                <div class="modal-header">
                    <h3>Definir Meta Mensal</h3>
                    <button class="modal-close" onclick="closeGoalModal()">&times;</button>
                </div>

                <form id="goalForm">
                    <div class="form-group">
                        <label for="goalTarget">Valor da Meta (R$)</label>
                        <input type="number" id="goalTarget" step="0.01" placeholder="2000.00" required>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Definir Meta</button>
                        <button type="button" class="btn btn-secondary" onclick="closeGoalModal()">Cancelar</button>
                    </div>
                </form>

            </div>
        </div>

    </div>

    <script src="assets/js/dashboard.js"></script>
</body>

</html>
