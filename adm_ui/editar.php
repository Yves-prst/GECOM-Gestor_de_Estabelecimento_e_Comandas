<?php
include 'conexao.php';

if ($_SERVER["REQUEST_METHOD"] === "GET") {
  $id = $_GET['id'];
  $produto = $conn->query("SELECT * FROM produtos WHERE idprodutos = $id")->fetch_assoc();
}
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $id = $_POST['idprodutos'];
  $nome = $_POST['nome'];
  $valor = $_POST['valor'];
  $status = $_POST['status'];

  $conn->query("UPDATE produtos SET nome = '$nome', valor= ' $valor', status = '$status' WHERE idprodutos = $id");
  header("Location: produtos.php");
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8"><title>Editar Produto</title>
  <link rel="stylesheet" href="assets/css/styleProdutos.css">
</head>
<body>
  <h2>Editar Produto</h2>
  <form method="POST">
    <input type="hidden" name="idprodutos" value="<?= $produto['idprodutos'] ?>">
    <input type="text" name="nome" value="<?= $produto['nome'] ?>" required>
    <input type="number" step="0.01" name="valor" value="<?= $produto['valor'] ?>" required>
    <select name="status">
      <option value="Ativo" <?= $produto['status'] == 'Ativo' ? 'selected' : '' ?>>Ativo</option>
      <option value="Inativo" <?= $produto['status'] == 'Inativo' ? 'selected' : '' ?>>Inativo</option>
    </select>
    <button type="submit">Salvar</button>
  </form>
</body>
</html>