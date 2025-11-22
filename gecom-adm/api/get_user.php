<?php
require_once '../config/database.php';
require_once '../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'ID do usuário não fornecido']);
    exit;
}

$id = (int)$_GET['id'];

$stmt = $pdo->prepare("SELECT id, name, username, email, phone, cargo FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['error' => 'Usuário não encontrado']);
    exit;
}

echo json_encode($user);
