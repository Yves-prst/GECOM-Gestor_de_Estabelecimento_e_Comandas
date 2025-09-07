<?php
require_once 'config/database.php';
require_once 'config/auth.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (login($username, $password)) {
        header('Location: dashboard.php');
        exit();
    } else {
        $error = 'Credenciais inválidas';
    }
}

if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema Administrativo</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h1>Sistema Administrativo</h1>
                <p>Entre com suas credenciais para acessar o sistema</p>
            </div>
            
            <form method="POST" class="login-form">
                <div class="form-group">
                    <label for="username">Usuário</label>
                    <div class="input-group">
                             
                        <input type="text" id="username" name="username" placeholder="Digite seu usuário" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="password">Senha</label>
                    <div class="input-group">
                       
                        <input type="password" id="password" name="password" placeholder="Digite sua senha" required>
                    </div>
                </div>
                
                <?php if ($error): ?>
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>
                
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i>
                    Entrar
                </button>
            </form>
            
            <div class="login-info">
                <p><strong>Primeira vez?</strong></p>
                <p>Use <strong>admin</strong> como usuário e <strong>admin123</strong> como senha.</p>
            </div>
        </div>
    </div>
</body>
</html>
