<?php
require_once 'config/database.php';
require_once 'config/auth.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = $_POST['id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $cargo = $_POST['cargo'] ?? '';

    try {
        if ($action === 'save') {
            if (empty($name) || empty($username) || empty($email) || empty($cargo)) {
                throw new Exception('Preencha todos os campos obrigatórios');
            }

            // Criptografar senha apenas se for novo usuário ou senha informada
            $passwordHash = !empty($password) ? password_hash($password, PASSWORD_DEFAULT) : null;

            if ($id > 0) {
                // Atualiza usuário existente
                if ($passwordHash) {
                    $stmt = $pdo->prepare("UPDATE users SET name=?, username=?, password=?, email=?, phone=?, cargo=? WHERE id=?");
                    $stmt->execute([$name, $username, $passwordHash, $email, $phone, $cargo, $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE users SET name=?, username=?, email=?, phone=?, cargo=? WHERE id=?");
                    $stmt->execute([$name, $username, $email, $phone, $cargo, $id]);
                }
                
            } else {
                // Novo usuário
                if (empty($password)) {
                    throw new Exception('A senha é obrigatória para novos usuários.');
                }
                $stmt = $pdo->prepare("INSERT INTO users (name, username, password, email, phone, cargo) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$name, $username, $passwordHash, $email, $phone, $cargo]);
                $_SESSION['success_message'] = 'Usuário cadastrado com sucesso!';
            }
        } elseif ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
           
        }
    } catch (PDOException $e) {
        $_SESSION['error_message'] = 'Erro no banco de dados: ' . $e->getMessage();
    } catch (Exception $e) {
        $_SESSION['error_message'] = $e->getMessage();
    }

    header('Location: funcionarios.php');
    exit;
}

$search = $_GET['search'] ?? '';

$query = "SELECT * FROM users";
$params = [];
$conditions = [];

if (!empty($search)) {
    $conditions[] = "(name LIKE ? OR email LIKE ? OR username LIKE ?)";
    $params = ["%$search%", "%$search%", "%$search%"];
}



if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}


$stmt = $pdo->prepare($query);
$stmt->execute($params);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Buscar usuário para edição
$editUser = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_GET['edit']]);
    $editUser = $stmt->fetch(PDO::FETCH_ASSOC);
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Usuários</title>
    <link rel="stylesheet" href="assets/css/style.css?v=1.1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <?php include 'includes/sidebar.php'; ?>
    <button class="mobile-menu-toggle" onclick="toggleSidebar()" style="margin:5px ; height: 20px; position: absolute;">
        <i class="fas fa-bars"></i>
    </button>

    <div class="main-content">
        <div class="header">
            <h1>Gerenciar Usuários</h1>
            <div class="header-actions">
                <form style="display: flex; gap: 5px" method="get" class="search-form">
                    <input style="width: 80%; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 14px; transition: border-color 0.3s; padding: 10px;" type="text" name="search" placeholder="Pesquisar..." value="<?= htmlspecialchars($search) ?>">
                    <button style="width: 20%; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 14px; transition: border-color 0.3s; padding: 10px;" type="submit"><i class="fas fa-search"></i></button>
                </form>
                <button class="btn btn-primary" onclick="openModal()">
                    <i class="fas fa-plus"></i> Novo Usuário
                </button>
            </div>
        </div>

        <?php if (isset($_SESSION['success_message'])): ?>
            <div class="alert alert-success">
                <?= $_SESSION['success_message']; unset($_SESSION['success_message']); ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_SESSION['error_message'])): ?>
            <div class="alert alert-danger">
                <?= $_SESSION['error_message']; unset($_SESSION['error_message']); ?>
            </div>
        <?php endif; ?>

        

        <div class="card">
            <div class="card-content">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Usuário</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Cargo</th>
                              
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                                <tr>
                                    <td><?= htmlspecialchars($user['name']) ?></td>
                                    <td><?= htmlspecialchars($user['username']) ?></td>
                                    <td><?= htmlspecialchars($user['email']) ?></td>
                                    <td><?= htmlspecialchars($user['phone']) ?></td>
                                    <td><?= ucfirst($user['cargo']) ?></td>
                                   
                                    <td class="actions">
                                        <button class="btn-icon" onclick="editUser(<?= $user['id'] ?>)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-danger" onclick="confirmDelete(<?= $user['id'] ?>)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div id="userModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Adicionar Usuário</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form method="post" id="userForm">
                <input type="hidden" name="action" value="save">
                <input type="hidden" name="id" id="userId" value="0">

                <div class="form-group">
                    <label for="name">Nome Completo *</label>
                    <input type="text" id="name" name="name" required>
                </div>

                <div class="form-group">
                    <label for="username">Usuário *</label>
                    <input type="text" id="username" name="username" required>
                </div>

                <div class="form-group">
                    <label for="password">Senha *</label>
                    <input type="password" id="password" name="password" placeholder="(deixe em branco para não alterar)">
                </div>

                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="form-group">
                    <label for="text">Telefone</label>
                    <input type="text" id="phone" name="phone">
                </div>

                <div class="form-group">
                    <label for="cargo">Cargo *</label>
                    <select id="cargo" name="cargo" required>
                        <option value="garcom">Garçom</option>
                        <option value="cozinheiro">Cozinheiro</option>
                        <option value="adm">Administrador</option>
                    </select>
                </div>

                

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function editUser(id) {
            fetch(`./api/get_user.php?id=${id}`)
                .then(r => r.json())
                .then(data => {
                    if (data && !data.error) {
                        document.getElementById('modalTitle').textContent = 'Editar Usuário';
                        document.getElementById('userId').value = data.id;
                        document.getElementById('name').value = data.name;
                        document.getElementById('username').value = data.username;
                        document.getElementById('email').value = data.email;
                        document.getElementById('phone').value = data.phone;
                        document.getElementById('cargo').value = data.cargo;
                       
                        openModal();
                    } else {
                        Swal.fire('Erro', data.error || 'Não foi possível carregar o usuário', 'error');
                    }
                })
        }

        function confirmDelete(id) {
            Swal.fire({
                title: 'Tem certeza?',
                text: "Essa ação não pode ser desfeita!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            }).then((r) => {
                if (r.isConfirmed) {
                    const form = document.createElement('form');
                    form.method = 'post';
                    form.action = 'funcionarios.php';
                    form.innerHTML = `<input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="${id}">`;
                    document.body.appendChild(form);
                    form.submit();
                }
            });
        }

        function openModal() {
            document.getElementById('userModal').style.display = 'block';
        }
        function closeModal() {
            document.getElementById('userModal').style.display = 'none';
            document.getElementById('userForm').reset();
            document.getElementById('userId').value = '0';
            document.getElementById('modalTitle').textContent = 'Adicionar Usuário';
        }
    </script>
</body>
</html>
