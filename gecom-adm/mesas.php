<?php
require_once 'config/database.php';

function sendJson($data)
{
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

$action = $_REQUEST['action'] ?? null;

if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $capacidade = $_POST['capacidade'] ?? null;
    $status = $_POST['status'] ?? 'disponivel';

    if (!$capacidade || !$status) {
        echo "Preencha todos os campos!";
        exit;
    }

    $stmt = $pdo->query("SELECT numero FROM mesas ORDER BY numero");
    $numerosExistentes = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $novoNumero = 1;
    foreach ($numerosExistentes as $n) {
        if ((int)$n === $novoNumero) {
            $novoNumero++;
        } else {
            break;
        }
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO mesas (numero, capacidade, status) VALUES (:numero, :capacidade, :status)");
        $stmt->execute([
            'numero' => $novoNumero,
            'capacidade' => $capacidade,
            'status' => $status
        ]);
        echo "Mesa criada com sucesso!";
    } catch (PDOException $e) {
        echo "Erro ao criar mesa: " . $e->getMessage();
    }
    exit;
}

if ($action === 'edit' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $capacidade = $_POST['capacidade'] ?? null;
    $status = $_POST['status'] ?? null;

    if (!$id || !$capacidade || !$status) {
        echo "Preencha todos os campos!";
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE mesas SET capacidade = :capacidade, status = :status WHERE id = :id");
        $stmt->execute([
            'id' => $id,
            'capacidade' => $capacidade,
            'status' => $status
        ]);
        echo "Mesa atualizada com sucesso!";
    } catch (PDOException $e) {
        echo "Erro ao atualizar mesa: " . $e->getMessage();
    }
    exit;
}

if ($action === 'delete' && isset($_GET['id'])) {
    $id = $_GET['id'];
    try {
        $stmt = $pdo->prepare("DELETE FROM mesas WHERE id = ?");
        $stmt->execute([$id]);
        echo "Mesa excluída com sucesso!";
    } catch (PDOException $e) {
        echo "Erro ao excluir mesa: " . $e->getMessage();
    }
    exit;
}

if ($action === 'get' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $pdo->prepare("SELECT * FROM mesas WHERE id = ?");
    $stmt->execute([$id]);
    $mesa = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$mesa) {
        sendJson(['error' => 'Mesa não encontrada']);
    }
    sendJson($mesa);
}

$stmt = $pdo->query("SELECT * FROM mesas ORDER BY numero");
$mesas = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8" />
    <title>Gerenciar Mesas</title>
    <link rel="stylesheet" href="assets/css/style.css?v=1.0" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
</head>

<body>
    <?php include 'includes/sidebar.php'; ?>

    <button class="mobile-menu-toggle" onclick="toggleSidebar()" style="margin:5px ; height: 20px; position: absolute;">
        <i class="fas fa-bars"></i>
    </button>

    <div class="main-content">
        <div class="header">
            <h1> Gerenciar Mesas</h1>
            <button class="btn btn-primary" onclick="openMesaModal()">
                <i class="fas fa-plus"></i> Adicionar Mesa
            </button>
        </div>

        <div class="stats-grid">
            <?php foreach ($mesas as $mesa): ?>
                <div class="tables-content">
                    <div class="stat-content">
                        <div class="header-tables">
                            <h2>Mesa <?php echo htmlspecialchars($mesa['numero']); ?></h2>
                            <button class="status-<?php echo htmlspecialchars($mesa['status']); ?>" disabled>
                                <?php echo ucfirst($mesa['status']); ?>
                            </button>
                        </div>
                        <h3>Capacidade: <?php echo htmlspecialchars($mesa['capacidade']); ?> pessoa<?php echo $mesa['capacidade'] > 1 ? 's' : ''; ?></h3>
                        <div class="icons-tables">
                            <button class="btn-icon" title="Editar" onclick="editMesa(<?php echo $mesa['id']; ?>)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger" title="Excluir" onclick="deleteMesa(<?php echo $mesa['id']; ?>)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Modal -->
    <div id="mesaModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalMesaTitle">Adicionar Mesa</h3>
                <button class="modal-close" aria-label="Fechar modal" onclick="closeMesaModal()">&times;</button>
            </div>
            <form id="mesaForm">
                <input type="hidden" id="mesaId" name="id" />
                <!-- CAMPO DE NUMERO REMOVIDO -->
                <div class="form-group">
                    <label for="mesaCapacidade">Capacidade (pessoas)</label>
                    <input type="number" id="mesaCapacidade" name="capacidade" required min="1" step="1" />
                </div>
                <div class="form-group">
                    <label for="mesaStatus">Status:</label>
                    <select id="mesaStatus" name="status" required>
                        <option value="disponivel">Disponível</option>
                        <option value="ocupada">Ocupada</option>
                        <option value="reservada">Reservada</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="closeMesaModal()">Cancelar</button>
                </div>
            </form>
        </div>
    </div>

    <script src="./assets/js/mesas.js"></script>
</body>

</html>