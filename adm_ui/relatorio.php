<?php
include 'conexao.php';
try {
  $pdo = new PDO("mysql:host=localhost;dbname=produtos_teste", "root", "1234");
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  die("Erro na conexão: " . $e->getMessage());
}

// Funções para datas
$dataInicioSemana = date('Y-m-d', strtotime('monday this week'));
$dataFimSemana = date('Y-m-d', strtotime('sunday this week'));
$dataInicioMes = date('Y-m-01');
$dataFimMes = date('Y-m-t');

// Função para buscar dados
function buscarMaisVendidos($pdo, $dataInicio, $dataFim)
{
  $stmt = $pdo->prepare("
        SELECT produto, SUM(quantidade) as total
        FROM vendas
        WHERE data_venda BETWEEN :inicio AND :fim
        GROUP BY produto
        ORDER BY total DESC
        LIMIT 5
    ");
  $stmt->execute(['inicio' => $dataInicio, 'fim' => $dataFim]);
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Dados
$dadosSemana = buscarMaisVendidos($pdo, $dataInicioSemana, $dataFimSemana);
$dadosMes = buscarMaisVendidos($pdo, $dataInicioMes, $dataFimMes);

// Para gráfico de pizza
$labelsSemana = array_column($dadosSemana, 'produto');
$valoresSemana = array_column($dadosSemana, 'total');
$labelsMes = array_column($dadosMes, 'produto');
$valoresMes = array_column($dadosMes, 'total');
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
  <meta charset="UTF-8">
  <title>Relatório de Vendas</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="assets/css/style.css?v=1.1">
  <script src="assets/js/script.js"></script>

  <style>
    a {
      text-decoration: none;
    }
  </style>

</head>

<body>

  <div class="menu-toggle" onclick="toggleMenu()">
    <i class="fa fa-bars" style="color:white;"></i>
  </div>


  <div class="menu">

    <a class="link-menu" href="index.php">

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
      Dashboard
    </a>

    <a class="link-menu" href="produtos.php"> <i class="fa-solid fa-box" style="color: white;"></i> Gerenciar Produtos</a>
    <a class="link-menu" href="#"> <i class="fa-solid fa-users" style="color: white;"></i> Gerenciar Funcionários</a>
    <a class="link-menu" href="relatorio.php"> <i class="fa-solid fa-chart-simple" style="color: white;"></i> Relatório de Vendas</a>
    <a class="link-menu" href="#"> <i class="fa-solid fa-gear" style="color: white;"></i> Configurações</a>
  </div>

  <div class="dashboard">

    <h2>📈 Relatório de Vendas</h2>

    <div class="row mt-4">
      <div class="col-md-6">
        <h4>Top 5 da Semana</h4>
        <canvas id="graficoSemanaBarras"></canvas>
      </div>
      <div class="col-md-6">
        <h4>Top 5 do Mês</h4>
        <canvas id="graficoMesBarras"></canvas>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-md-6">
        <h4>Distribuição - Semana</h4>
        <canvas id="graficoSemanaPizza"></canvas>
      </div>
      <div class="col-md-6">
        <h4>Distribuição - Mês</h4>
        <canvas id="graficoMesPizza"></canvas>
      </div>
    </div>

  </div>


  <script>
    const labelsSemana = <?= json_encode($labelsSemana) ?>;
    const valoresSemana = <?= json_encode($valoresSemana) ?>;
    const labelsMes = <?= json_encode($labelsMes) ?>;
    const valoresMes = <?= json_encode($valoresMes) ?>;

    new Chart(document.getElementById('graficoSemanaBarras'), {
      type: 'bar',
      data: {
        labels: labelsSemana,
        datasets: [{
          label: 'Quantidade Vendida',
          data: valoresSemana,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      }
    });

    new Chart(document.getElementById('graficoMesBarras'), {
      type: 'bar',
      data: {
        labels: labelsMes,
        datasets: [{
          label: 'Quantidade Vendida',
          data: valoresMes,
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }]
      }
    });

    new Chart(document.getElementById('graficoSemanaPizza'), {
      type: 'pie',
      data: {
        labels: labelsSemana,
        datasets: [{
          data: valoresSemana,
          backgroundColor: ['#36a2eb', '#4bc0c0', '#ffcd56', '#ff6384', '#9966ff']
        }]
      }
    });

    new Chart(document.getElementById('graficoMesPizza'), {
      type: 'pie',
      data: {
        labels: labelsMes,
        datasets: [{
          data: valoresMes,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#2ecc71']
        }]
      }
    });
  </script>

</body>

</html>