<?php
$host = "localhost";
$username = "root";
$password = "1234";
$database = "admin_system3";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Erro de conexão: " . $e->getMessage());
}

$stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = 'admin'");
$stmt->execute();

if ($stmt->fetchColumn() == 0) {
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, username, password, phone, cargo)
        VALUES (:name, :email, :username, :password, :phone, :cargo)
    ");
   
}
?>
