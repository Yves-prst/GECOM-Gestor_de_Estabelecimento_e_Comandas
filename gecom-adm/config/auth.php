<?php
session_start();

function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: index.php');
        exit();
    }
}

function login($username, $password) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        return true;
    }
    
    return false;
}

function logout() {
    session_destroy();
    header('Location: ../index.php');
    exit();
}


function requireAdmin() {
    requireLogin(); 

    // Verifica se o usuário tem cargo de administrador
    if (!isset($_SESSION['users_cargo']) || $_SESSION['user_cargo'] !== 'adm') {
        $_SESSION['error_message'] = 'Acesso negado. Você precisa ser administrador.';
        header('Location: dashboard.php');
        exit();
    }
}
