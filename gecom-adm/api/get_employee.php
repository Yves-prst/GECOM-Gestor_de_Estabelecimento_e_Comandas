<?php
require_once '../config/database.php';
require_once '../config/auth.php';
requireAdmin();

header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'ID do funcionário não fornecido']);
    exit;
}

$id = $_GET['id'];
$stmt = $pdo->prepare("SELECT * FROM employees WHERE id = ?");
$stmt->execute([$id]);
$employee = $stmt->fetch();

if (!$employee) {
    echo json_encode(['error' => 'Funcionário não encontrado']);
    exit;
}

echo json_encode([
    'id' => $employee['id'],
    'name' => $employee['name'],
    'email' => $employee['email'],
    'cpf' => $employee['cpf'],
    'phone' => $employee['phone'],
    'position' => $employee['position'],
    'status' => $employee['status'],
    'pin_code' => $employee['pin_code'],
    'created_at' => $employee['created_at'],
    'updated_at' => $employee['updated_at']
]);