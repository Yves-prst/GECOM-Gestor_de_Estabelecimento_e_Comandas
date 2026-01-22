<?php
require_once 'config/database.php';
require_once 'config/auth.php';
requireLogin();

$startOfWeek = date('Y-m-d', strtotime('monday this week'));
$endOfWeek = date('Y-m-d', strtotime('sunday this week'));

$stmt = $pdo->prepare("
    SELECT 
        product_name as product,
        SUM(quantity) as quantity,
        SUM(total_price) as total
    FROM sales 
    WHERE DATE(sale_date) BETWEEN ? AND ?
    GROUP BY product_name
    ORDER BY total DESC
    LIMIT 5
");
$stmt->execute([$startOfWeek, $endOfWeek]);
$weekData = $stmt->fetchAll();

$startOfMonth = date('Y-m-01');
$endOfMonth = date('Y-m-t');

$stmt = $pdo->prepare("
    SELECT 
        product_name as product,
        SUM(quantity) as quantity,
        SUM(total_price) as total
    FROM sales 
    WHERE DATE(sale_date) BETWEEN ? AND ?
    GROUP BY product_name
    ORDER BY total DESC
    LIMIT 5
");
$stmt->execute([$startOfMonth, $endOfMonth]);
$monthData = $stmt->fetchAll();


?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatórios - Sistema Administrativo</title>
    <link rel="stylesheet" href="assets/css/style.css?v=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>
    <?php include 'includes/sidebar.php'; ?>

    <button class="mobile-menu-toggle" onclick="toggleSidebar()" style="margin:5px ; height: 20px; position: absolute;">
        <i class="fas fa-bars"></i>
    </button>

    <div class="main-content">
        <div class="header">
        
            <h1> Relatórios de Vendas</h1>
            <div class="header-actions">
                <select id="periodSelect" class="form-select">
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                </select>
                <button class="btn btn-primary" onclick="generatePDF()">
                    <i class="fas fa-file-pdf"></i>
                    Gerar PDF
                </button>
            </div>
        </div>

        <!-- Resumo -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i style="color: white;" class="fas fa-shopping-cart"></i>
                </div>
                <div class="stat-content">
                    <h3>Total de Itens</h3>
                    <div class="stat-value" id="totalItems">
                        <?php echo array_sum(array_column($weekData, 'quantity')); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i style="color: white;" class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-content">
                    <h3>Receita Total</h3>
                    <div class="stat-value" id="totalRevenue">
                        R$ <?php echo number_format(array_sum(array_column($weekData, 'total')), 2, ',', '.'); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i style="color: white;" class="fas fa-box"></i>
                </div>
                <div class="stat-content">
                    <h3>Produtos Diferentes</h3>
                    <div class="stat-value" id="totalProducts">
                        <?php echo count($weekData); ?>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i style="color: white;" class="fas fa-trophy"></i>
                </div>
                <div class="stat-content">
                    <h3>Mais Vendido</h3>
                    <div class="stat-value" id="topProduct">
                        <?php echo $weekData[0]['product'] ?? 'N/A'; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gráfico -->
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-bar-chart"></i> Top 5 Produtos - <span id="chartPeriod">Semana</span></h3>
            </div>
            <div class="card-content">
                <canvas id="barChart"></canvas>
            </div>
        </div>

        <!-- Tabela Detalhada -->
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-table"></i> Detalhamento de Vendas</h3>
            </div>
            <div class="card-content">
                <div class="table-responsive">
                    <table class="table" id="salesTable">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Total (R$)</th>
                                <th>Participação</th>
                            </tr>
                        </thead>
                        <tbody id="salesTableBody">
                            <!-- Preenchido via JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        const weekData = <?php echo json_encode($weekData); ?>;
        const monthData = <?php echo json_encode($monthData); ?>;

        let currentPeriod = 'week';
        let barChart;

        document.addEventListener('DOMContentLoaded', function() {
            initChart();
            updateTable();

            document.getElementById('periodSelect').addEventListener('change', function() {
                currentPeriod = this.value;
                updateChart();
                updateTable();
                updateStats();
            });
        });

        function initChart() {
            const barCtx = document.getElementById('barChart').getContext('2d');

            barChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: weekData.map(item => item.product),
                    datasets: [{
                        label: 'Quantidade Vendida',
                        data: weekData.map(item => item.quantity),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function updateChart() {
            const data = currentPeriod === 'week' ? weekData : monthData;

            barChart.data.labels = data.map(item => item.product);
            barChart.data.datasets[0].data = data.map(item => item.quantity);
            barChart.update();

            document.getElementById('chartPeriod').textContent = currentPeriod === 'week' ? 'Semana' : 'Mês';
        }

        function updateTable() {
            const data = currentPeriod === 'week' ? weekData : monthData;
            const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total), 0);
            const tbody = document.getElementById('salesTableBody');

            tbody.innerHTML = '';

            data.forEach(item => {
                const percentage = ((parseFloat(item.total) / totalRevenue) * 100).toFixed(1);
                const row = `
                    <tr>
                        <td>${item.product}</td>
                        <td>${item.quantity}</td>
                        <td>R$ ${parseFloat(item.total).toFixed(2).replace('.', ',')}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }

        function updateStats() {
            const data = currentPeriod === 'week' ? weekData : monthData;
            const totalItems = data.reduce((sum, item) => sum + parseInt(item.quantity), 0);
            const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.total), 0);

            document.getElementById('totalItems').textContent = totalItems;
            document.getElementById('totalRevenue').textContent = 'R$ ' + totalRevenue.toFixed(2).replace('.', ',');
            document.getElementById('totalProducts').textContent = data.length;
            document.getElementById('topProduct').textContent = data[0]?.product || 'N/A';
        }

        function generatePDF() {
            window.open(`api/generate_pdf.php?period=${currentPeriod}`, '_blank');
        }
    </script>
</body>

</html>