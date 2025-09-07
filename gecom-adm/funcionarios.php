<?php
require_once 'config/database.php';
require_once 'config/auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $id = $_POST['id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $cpf = $_POST['cpf'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $position = $_POST['position'] ?? '';
    $status = $_POST['status'] ?? 'ativo';

    try {
        if ($action === 'save') {
            if (empty($name) || empty($email) || empty($cpf) || empty($position)) {
                throw new Exception('Preencha todos os campos obrigatórios');
            }

            if (!validaCPF($cpf)) {
                throw new Exception('CPF inválido');
            }

            if ($id > 0) {
                $stmt = $pdo->prepare("UPDATE employees SET name = ?, email = ?, cpf = ?, phone = ?, position = ?, status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$name, $email, $cpf, $phone, $position, $status, $id]);
                $_SESSION['success_message'] = 'Funcionário atualizado com sucesso!';
            } else {
                $stmt = $pdo->prepare("INSERT INTO employees (name, email, cpf, phone, position, status) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$name, $email, $cpf, $phone, $position, $status]);
                $_SESSION['success_message'] = 'Funcionário cadastrado com sucesso!';
            }
        } elseif ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
            $stmt->execute([$id]);
            $_SESSION['success_message'] = 'Funcionário removido com sucesso!';
        } elseif ($action === 'generate_pin') {
            $pin = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $stmt = $pdo->prepare("UPDATE employees SET pin_code = ? WHERE id = ?");
            $stmt->execute([$pin, $id]);
            $_SESSION['success_message'] = 'PIN gerado com sucesso: ' . $pin;
        }
    } catch (PDOException $e) {
        $_SESSION['error_message'] = 'Erro no banco de dados: ' . $e->getMessage();
    } catch (Exception $e) {
        $_SESSION['error_message'] = $e->getMessage();
    }

    header('Location: funcionarios.php');
    exit;
}

function validaCPF($cpf)
{
    $cpf = preg_replace('/[^0-9]/', '', $cpf);

    if (strlen($cpf) != 11) {
        return false;
    }

    if (preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }

    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    return true;
}

$search = $_GET['search'] ?? '';
$status_filter = $_GET['status'] ?? 'all';

$query = "SELECT e.*, 
          (SELECT COUNT(*) FROM employee_shifts WHERE employee_id = e.id AND end_time IS NULL) AS is_working
          FROM employees e";

$params = [];
$conditions = [];

if (!empty($search)) {
    $conditions[] = "(e.name LIKE ? OR e.email LIKE ? OR e.cpf LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($status_filter !== 'all') {
    $conditions[] = "e.status = ?";
    $params[] = $status_filter;
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

$query .= " ORDER BY e.status, e.name";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$employees = $stmt->fetchAll();

// Buscar funcionário para edição
$editEmployee = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = ?");
    $stmt->execute([$_GET['edit']]);
    $editEmployee = $stmt->fetch();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Funcionários</title>
    <link rel="stylesheet" href="assets/css/style.css?v=1.0">
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
            <h1> Gerenciar Funcionários</h1>
            <div class="header-actions" style="flex-wrap: wrap;">
                <form method="get" class="search-form">
                    <input style="height: 35px; width: 200px; border-radius: 5px; padding-left: 10px; " type="text" name="search" placeholder="Pesquisar..." value="<?= htmlspecialchars($search) ?>">
                    <button style="height: 35px; width: 40px; border-radius: 5px; transition: 0.4s" type="submit"><i class="fas fa-search"></i></button>
                </form>
                <button class="btn btn-primary" onclick="openModal()">
                    <i class="fas fa-plus"></i> Novo Funcionário
                </button>
            </div>
        </div>

        <?php if (isset($_SESSION['success_message'])): ?>
            <div class="alert alert-success">
                <?= $_SESSION['success_message'] ?>
                <?php unset($_SESSION['success_message']); ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_SESSION['error_message'])): ?>
            <div class="alert alert-danger">
                <?= $_SESSION['error_message'] ?>
                <?php unset($_SESSION['error_message']); ?>
            </div>
        <?php endif; ?>

        <!-- Filtros -->
        <div class="filters">
            <a href="?status=all" class="filter-btn <?= $status_filter === 'all' ? 'active' : '' ?>">Todos</a>
            <a href="?status=ativo" class="filter-btn <?= $status_filter === 'ativo' ? 'active' : '' ?>">Ativos</a>
            <a href="?status=inativo" class="filter-btn <?= $status_filter === 'inativo' ? 'active' : '' ?>">Inativos</a>
            <a href="?status=folga" class="filter-btn <?= $status_filter === 'folga' ? 'active' : '' ?>">Folga</a>
        </div>

        <!-- Lista de Funcionários -->
        <div class="card">
            <div class="card-content">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>CPF</th>
                                <th>Cargo</th>
                                <th>Status</th>
                                <th>Turno</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($employees as $employee): ?>
                                <tr>
                                    <td><?= htmlspecialchars($employee['name']) ?></td>
                                    <td><?= htmlspecialchars($employee['email']) ?></td>
                                    <td class="cpf"><?= htmlspecialchars($employee['cpf']) ?></td>
                                    <td><?= ucfirst($employee['position']) ?></td>
                                    <td>
                                        <span class="badge badge-<?=
                                                                    $employee['status'] === 'ativo' ? 'success' : ($employee['status'] === 'folga' ? 'warning' : 'secondary')
                                                                    ?>">
                                            <?= ucfirst($employee['status']) ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php if ($employee['is_working']): ?>
                                            <span class="badge badge-success">Em turno</span>
                                        <?php else: ?>
                                            <span class="badge badge-secondary">Fora</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="actions">
                                        <button class="btn-icon" onclick="editEmployee(<?= $employee['id'] ?>)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-danger" onclick="confirmDelete(<?= $employee['id'] ?>)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <?php if ($employee['status'] === 'ativo'): ?>
                                            <button class="btn-icon btn-info" onclick="generatePin(<?= $employee['id'] ?>)" title="Gerar PIN">
                                                <i class="fas fa-key"></i>
                                            </button>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para Adicionar/Editar Funcionário -->
    <div id="employeeModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Adicionar Funcionário</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form method="post" id="employeeForm">
                <input type="hidden" name="action" value="save">
                <input type="hidden" name="id" id="employeeId" value="0">

                <div class="form-group">
                    <label for="name">Nome Completo *</label>
                    <input type="text" id="name" name="name" required>
                </div>

                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="form-group">
                    <label for="cpf">CPF *</label>
                    <input type="text" id="cpf" name="cpf" class="cpf-input" required>
                </div>

                <div class="form-group">
                    <label for="phone">Telefone</label>
                    <input type="text" id="phone" name="phone" class="phone-input">
                </div>

                <div class="form-group">
                    <label for="position">Cargo *</label>
                    <select id="position" name="position" required>
                        <option value="garcom">Garçom</option>
                        <option value="caixa">Caixa</option>
                        <option value="cozinha">Cozinha</option>
                        <option value="gerente">Gerente</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="status">Status *</label>
                    <select id="status" name="status" required>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="folga">Folga</option>
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
        function applyMasks() {
            // Máscara para CPF
            $('.cpf-input').inputmask('999.999.999-99');
            $('.phone-input').inputmask('(99) 99999-9999');
        }

        function editEmployee(id) {
            fetch(`api/get_employee.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data && typeof data === 'object' && !data.error) {
                        document.getElementById('modalTitle').textContent = 'Editar Funcionário';
                        document.getElementById('employeeId').value = data.id;
                        document.getElementById('name').value = data.name;
                        document.getElementById('email').value = data.email;
                        document.getElementById('cpf').value = data.cpf;
                        document.getElementById('phone').value = data.phone;
                        document.getElementById('position').value = data.position;
                        document.getElementById('status').value = data.status;

                        openModal();
                    } else {
                        const message = data?.error || 'Erro desconhecido ao carregar os dados';
                        Swal.fire('Erro', message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar funcionário:', error);
                    console.error('Erro', 'Não foi possível carregar os dados do funcionário', 'error');
                });
        }

        function confirmDelete(id) {
            Swal.fire({
                title: 'Tem certeza?',
                text: "Você não poderá reverter isso!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const form = document.createElement('form');
                    form.method = 'post';
                    form.action = 'funcionarios.php';

                    const actionInput = document.createElement('input');
                    actionInput.type = 'hidden';
                    actionInput.name = 'action';
                    actionInput.value = 'delete';
                    form.appendChild(actionInput);

                    const idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id';
                    idInput.value = id;
                    form.appendChild(idInput);

                    document.body.appendChild(form);
                    form.submit();
                }
            });
        }

        function generatePin(id) {
            Swal.fire({
                title: 'Gerar novo PIN?',
                text: "Um novo PIN de 6 dígitos será gerado para este funcionário.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Gerar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const form = document.createElement('form');
                    form.method = 'post';
                    form.action = 'funcionarios.php';

                    const actionInput = document.createElement('input');
                    actionInput.type = 'hidden';
                    actionInput.name = 'action';
                    actionInput.value = 'generate_pin';
                    form.appendChild(actionInput);

                    const idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id';
                    idInput.value = id;
                    form.appendChild(idInput);

                    document.body.appendChild(form);
                    form.submit();
                }
            });
        }

        function openModal() {
            document.getElementById('employeeModal').style.display = 'block';
            applyMasks();
        }

        function closeModal() {
            document.getElementById('employeeModal').style.display = 'none';
            document.getElementById('employeeForm').reset();
            document.getElementById('employeeId').value = '0';
            document.getElementById('modalTitle').textContent = 'Adicionar Funcionário';
        }

        window.onclick = function(event) {
            const modal = document.getElementById('employeeModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/5.0.6/jquery.inputmask.min.js';
            document.head.appendChild(script);

            script.onload = applyMasks;
        });
    </script>
</body>

</html>