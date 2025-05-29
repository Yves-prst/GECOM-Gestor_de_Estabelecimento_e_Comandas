<?php include 'conexao.php'; ?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
  <meta charset="UTF-8">
  <title>Gerenciar Produtos</title>
  <link rel="stylesheet" href="assets/css/styleProdutos.css?v=1.1">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="assets/css/style.css?v=1.1">
  <script src="assets/js/script.js"></script>

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

      <h1>Gerenciar Produtos</h2>
  <form method="POST" action="adicionar.php">

  <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;">

      <input type="text" name="nome" placeholder="Nome do Produto" required>
      <input type="number" step="0.01" name="valor" placeholder="Preço" required>
      <select name="status">
        <option value="Ativo">Ativo</option>
        <option value="Inativo">Inativo</option>
      </select>
      <button class="btn" type="submit">Adicionar</button>
    </div>
    

  </form>

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

</body>

</html>