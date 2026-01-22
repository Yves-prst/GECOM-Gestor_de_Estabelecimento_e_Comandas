<?php
require_once 'config/database.php';
require_once 'config/auth.php';
requireLogin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        
        try {
            switch ($action) {
                case 'get_addons':
                    if (!isset($_POST['category_id'])) {
                        echo json_encode([]);
                        exit;
                    }
                    
                    $categoryId = intval($_POST['category_id']);
                    $stmt = $pdo->prepare("SELECT * FROM category_addons WHERE category_id = ? ORDER BY name");
                    $stmt->execute([$categoryId]);
                    $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    echo json_encode($addons);
                    exit;
                    
                case 'save_addon':
                    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
                    $categoryId = intval($_POST['category_id']);
                    $name = trim($_POST['name']);
                    $price = floatval($_POST['price']);
                    
                    if (empty($name)) {
                        throw new Exception('Nome do adicional é obrigatório.');
                    }
                    
                    if ($id > 0) {
                        $stmt = $pdo->prepare("UPDATE category_addons SET name = ?, price = ? WHERE id = ?");
                        $stmt->execute([$name, $price, $id]);
                        $message = 'Adicional atualizado com sucesso!';
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO category_addons (category_id, name, price) VALUES (?, ?, ?)");
                        $stmt->execute([$categoryId, $name, $price]);
                        $message = 'Adicional criado com sucesso!';
                    }
                    
                    echo json_encode(['success' => true, 'message' => $message]);
                    exit;
                    
                case 'delete_addon':
                    $id = intval($_POST['id']);
                    
                    $stmt = $pdo->prepare("DELETE FROM category_addons WHERE id = ?");
                    $stmt->execute([$id]);
                    
                    echo json_encode(['success' => true, 'message' => 'Adicional excluído com sucesso!']);
                    exit;
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
}

$stmt = $pdo->query("
    SELECT c.*, COUNT(p.id) as product_count 
    FROM categories c 
    LEFT JOIN products p ON c.id = p.category_id 
    GROUP BY c.id 
    ORDER BY c.id ASC
");
$categories = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Categorias - Sistema Administrativo</title>
    <link rel="stylesheet" href="assets/css/style.css?v=1.1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .btn-info {
            background-color: #17a2b8;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-info:hover {
            background-color: #138496;
            color: white;
        }

        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 0;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid #e5e5e5;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #aaa;
        }

        .modal-close:hover {
            color: #000;
        }

        .modal-body {
            padding: 20px;
        }

        .text-center {
            text-align: center;
        }
        
        .addon-price {
            font-weight: bold;
            color: #28a745;
        }
    </style>
</head>
<body>
    <?php include 'includes/sidebar.php'; ?>

    <button class="mobile-menu-toggle" onclick="toggleSidebar()" style="margin:5px ; height: 20px; position: absolute;">
        <i class="fas fa-bars"></i>
    </button>
    
    <div class="main-content">
        <div class="header">
        
            <h1>Gerenciar Categorias</h1>
            <button class="btn btn-primary" onclick="openCategoryModal()">
                <i class="fas fa-plus"></i>
                Adicionar Categoria
            </button>
        </div>
        
        <div class="card">
            <div class="card-content">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Produtos</th>
                                <th>Adicionais</th>
                                <th style="text-align: center;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($categories as $category): ?>
                                <tr>                                  
                                    <td><?php echo htmlspecialchars($category['name']); ?></td>
                                    <td><?php echo htmlspecialchars($category['description'] ?? '-'); ?></td>
                                    <td>
                                        <span class="product-count">
                                            <i class="fas fa-box"></i>
                                            <?php echo $category['product_count']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-icon btn-info" onclick="manageAddons(<?php echo $category['id']; ?>, '<?php echo htmlspecialchars($category['name']); ?>')">
                                            <i class="fas fa-list"></i>
                                            Gerenciar
                                        </button>
                                    </td>
                                    <td class="actions">
                                        <button class="btn-icon" onclick="editCategory(<?php echo htmlspecialchars(json_encode($category)); ?>)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-danger" onclick="deleteCategory(<?php echo $category['id']; ?>)">
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
    
    <!-- Modal para adicionar/editar categoria -->
    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Adicionar Categoria</h3>
                <button class="modal-close" onclick="closeCategoryModal()">&times;</button>
            </div>
            <form id="categoryForm">
                <input type="hidden" id="categoryId">
                <div class="form-group">
                    <label for="categoryName">Nome da Categoria</label>
                    <input type="text" id="categoryName" required>
                </div>
                <div class="form-group">
                    <label for="categoryDescription">Descrição (opcional)</label>
                    <textarea id="categoryDescription" rows="3" placeholder="Descrição da categoria"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="closeCategoryModal()">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Modal para gerenciar adicionais -->
    <div id="addonsModal" class="modal">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3 id="addonsModalTitle">Gerenciar Adicionais</h3>
                <button class="modal-close" onclick="closeAddonsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="header" style="padding: 0; margin-bottom: 20px;">
                    <h4>Adicionais da categoria: <span id="categoryNameTitle"></span></h4>
                    <button class="btn btn-primary" onclick="openAddonModal()">
                        <i class="fas fa-plus"></i>
                        Adicionar Adicional
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Preço</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="addonsList">
                            <!-- Os adicionais serão carregados aqui via JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal para adicionar/editar adicional -->
    <div id="addonModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="addonModalTitle">Adicionar Adicional</h3>
                <button class="modal-close" onclick="closeAddonModal()">&times;</button>
            </div>
            <form id="addonForm">
                <input type="hidden" id="addonId">
                <input type="hidden" id="addonCategoryId">
                <div class="form-group">
                    <label for="addonName">Nome do Adicional</label>
                    <input type="text" id="addonName" required>
                </div>
                <div class="form-group">
                    <label for="addonPrice">Preço (R$)</label>
                    <input type="number" id="addonPrice" step="0.01" min="0" value="0" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar</button>
                    <button type="button" class="btn btn-secondary" onclick="closeAddonModal()">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="assets/js/categories.js"></script>
    <script>
    let currentCategoryId = null;
    let currentCategoryName = null;

    function manageAddons(categoryId, categoryName) {
        currentCategoryId = categoryId;
        currentCategoryName = categoryName;

        document.getElementById('categoryNameTitle').textContent = categoryName;
        document.getElementById('addonsModalTitle').textContent = 'Adicionais: ' + categoryName;

        loadCategoryAddons(categoryId);

        document.getElementById('addonsModal').style.display = 'block';
    }
    
    function closeAddonsModal() {
        document.getElementById('addonsModal').style.display = 'none';
        currentCategoryId = null;
        currentCategoryName = null;
    }
    
    function loadCategoryAddons(categoryId) {
        const formData = new FormData();
        formData.append('action', 'get_addons');
        formData.append('category_id', categoryId);
        
        fetch('categorias.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(addons => {
            const addonsList = document.getElementById('addonsList');
            addonsList.innerHTML = '';
            
            if (addons.length === 0) {
                addonsList.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum adicional cadastrado</td></tr>';
                return;
            }
            
            addons.forEach(addon => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${addon.name}</td>
                    <td class="addon-price">R$ ${parseFloat(addon.price).toFixed(2)}</td>
                    <td>
                        <button class="btn-icon" onclick="editAddon(${addon.id}, '${addon.name.replace(/'/g, "\\'")}', ${addon.price})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteAddon(${addon.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                addonsList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar adicionais:', error);
            alert('Erro ao carregar adicionais da categoria.');
        });
    }
    
    function openAddonModal(addonId = null, name = '', price = 0) {
        const modal = document.getElementById('addonModal');
        const title = document.getElementById('addonModalTitle');
        const form = document.getElementById('addonForm');
        
        if (addonId) {
            title.textContent = 'Editar Adicional';
            document.getElementById('addonId').value = addonId;
            document.getElementById('addonName').value = name;
            document.getElementById('addonPrice').value = price;
        } else {
            title.textContent = 'Adicionar Adicional';
            form.reset();
            document.getElementById('addonId').value = '';
            document.getElementById('addonCategoryId').value = currentCategoryId;
        }
        
        modal.style.display = 'block';
    }
    
    function closeAddonModal() {
        document.getElementById('addonModal').style.display = 'none';
    }
    
    function editAddon(id, name, price) {
        openAddonModal(id, name, price);
    }
    
    function deleteAddon(id) {
        if (confirm('Tem certeza que deseja excluir este adicional?')) {
            const formData = new FormData();
            formData.append('action', 'delete_addon');
            formData.append('id', id);
            
            fetch('categorias.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Adicional excluído com sucesso!');
                    loadCategoryAddons(currentCategoryId);
                } else {
                    alert('Erro ao excluir adicional: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao excluir adicional.');
            });
        }
    }

    document.getElementById('addonForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('action', 'save_addon');
        formData.append('id', document.getElementById('addonId').value);
        formData.append('category_id', document.getElementById('addonCategoryId').value || currentCategoryId);
        formData.append('name', document.getElementById('addonName').value);
        formData.append('price', document.getElementById('addonPrice').value);
        
        fetch('categorias.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Adicional salvo com sucesso!');
                closeAddonModal();
                loadCategoryAddons(currentCategoryId);
            } else {
                alert('Erro ao salvar adicional: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar adicional.');
        });
    });

    window.addEventListener('click', function(event) {
        const categoryModal = document.getElementById('categoryModal');
        const addonsModal = document.getElementById('addonsModal');
        const addonModal = document.getElementById('addonModal');
        
        if (event.target === categoryModal) {
            closeCategoryModal();
        }
        
        if (event.target === addonsModal) {
            closeAddonsModal();
        }
        
        if (event.target === addonModal) {
            closeAddonModal();
        }
    });
    </script>
</body>
</html>