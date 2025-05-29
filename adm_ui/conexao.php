<?php
$host = "localhost";
$user = "root";
$senha = "1234";
$banco = "produtos_teste"; 

$conn = new mysqli($host, $user, $senha, $banco);

if ($conn->connect_error) {
  die("Erro de conexão: " . $conn->connect_error);
}
?>