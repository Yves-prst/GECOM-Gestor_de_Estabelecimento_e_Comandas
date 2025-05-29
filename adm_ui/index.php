<?php include 'conexao.php'; ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="assets/css/style.css?v=1.1">
  <script src="assets/js/script.js"></script>

  <title>Document</title>
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
    <h1 style="margin-left: 20px;">Dashboard</h1>

    <div class="content">

      <div class="total">
        <p>Total Vendido Hoje</p>

        <div id="valor">
          <p style="line-height: 50px; font-size: 20px;">R$</p>
          <p id="p-valor">1234,56</p>
          <i class="fa-solid fa-eye" id="icone" onclick="Esconder()"></i>
        </div>

      </div>

      <div class="comandas-abertas">
        <i class="fa-solid fa-clock" style="font-size: 33px;"></i>

        <p>Comandas Abertas</p>

        <p>5</p>
      </div>

      <div class="comandas-fechadas">
        <i class="fa-solid fa-clock" style="font-size: 33px;"></i>

        <p>Comandas Fechadas</p>

        <p>55</p>
      </div>

      <div class="funcionarios-ativos">

        <i class="fa-solid fa-users" style="font-size: 32px;"></i>

        <p>Funcionários Ativos</p>

        <p>10</p>

      </div>

    </div>

    <div class="metas">

      <div class="menu-metas">
        <h2>Meta Mensais de Vendas</h2>
        <button class="buttons" id="button">Definir Meta</button>

      </div>

      <h3 style="margin-left: 10px;">R$ 544,28 / R$ 2000,00</h3>

      <br>

      <div class="progress-bar">
        <div class="progress-bar-fill">27%</div>
      </div>
    </div>

    <div class="produtos">
      <div class="menu-produtos">
        <p style="font-size: medium; font-weight: bold;">Gerenciar Produtos</p>
        <a href="produtos.php"><button class="buttons">Ver Produtos</button></a>
      </div>

      <div class="tabela-produtos">
        <table>
          <thead>
            <tr style="background-color:#e0e0e0;">
              <th>ID</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Status</th>
              <th class="action">Ações</th>
            </tr>
          </thead>

          <tbody>
            <?php
            $result = $conn->query("SELECT * FROM produtos");
            while ($row = $result->fetch_assoc()) {
              echo "<tr>
              <td>{$row['idprodutos']}</td>
              <td>{$row['nome']}</td>
              <td>R$ {$row['valor']}</td>
              <td>{$row['status']}</td>
              <td style=\"text-align: center; \">
                <a href='editar.php?id={$row['idprodutos']}'\">
                  <i class=\"fa fa-pen\" style=\"color: black; \"></i>
                </a>
              </td>

            </tr>";
            }
            ?>
          </tbody>

      </div>
    </div>


  </div>
</body>

</html>