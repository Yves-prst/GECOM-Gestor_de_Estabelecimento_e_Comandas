<?php
include 'conexao.php';

$nome = $_POST['nome'];
$valor = $_POST['valor'];
$status = $_POST['status'];

$sql = "INSERT INTO produtos ( nome, valor, status)
        VALUES ('$nome', '$valor', '$status')";

if ($conn->query($sql) === TRUE) {
  header("Location: produtos.php");
} else {
  echo "Erro: " . $conn->error;
}
?>