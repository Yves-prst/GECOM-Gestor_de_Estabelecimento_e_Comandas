<?php
session_start();
require_once 'db_config.php';

// Verificar se usuário está logado (simulação)
if (!isset($_SESSION['user_id'])) {
    // Redirecionar para login se necessário
    // header('Location: login.php');
    // exit;
}

// Definir usuário da cozinha (para exemplo)
$_SESSION['user_id'] = 1;
$_SESSION['user_role'] = 'cozinheiro';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visor de Cozinha</title>
    <link rel="stylesheet" href="style.css?v=1.0">
</head>
<body>
    <div class="container">
        <header>
            <h1>Visor de Cozinha</h1>
            <div class="status-bar">
                <span id="current-time"></span>
                <span id="order-count">0 pedidos</span>
            </div>
        </header>

        <div class="filters">
            <button class="filter-btn active" data-status="all">Todos</button>
            <button class="filter-btn" data-status="sent_to_kitchen">Novos</button>
            <button class="filter-btn" data-status="preparing">Em Preparação</button>
            <button class="filter-btn" data-status="ready">Prontos</button>
        </div>

        <div id="orders-container" class="orders-grid">
            <!-- Pedidos serão carregados aqui via JavaScript -->
        </div>

        <div id="no-orders" class="no-orders" style="display: none;">
            <p>Nenhum pedido encontrado</p>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>