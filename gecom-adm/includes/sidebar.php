<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin System Responsivo</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
          display: flex;
          flex-direction: row;
          height: 100vh;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          height: 100dvh;
          width: 250px;
          background: #2c3e50;
          padding: 50px 0 60px 0;
          display: flex;
          flex-direction: column;
          color: white;
          border-radius: 0px 10px 10px 0px;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        .sidebar.collapsed {
          transform: translateX(-100%);
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #34495e;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-header h2 {
          font-size: 20px;
          font-weight: 600;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          transition: background-color 0.3s;
        }

        .sidebar-toggle:hover {
          background-color: #34495e;
        }

        .sidebar-nav {
          padding: 20px 0;
          flex: 1;
          overflow-y: auto;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: #bdc3c7;
          text-decoration: none;
          transition: all 0.3s;
          background-color: 3px solid transparent;
        }

        .nav-link:hover {
          background-color: #34495e;
          color: white;
          background-color: #3498db;
        }

        .nav-link.active {
          background-color: #3498db;
          color: white;
          background-color: #2980b9;
        }

        .nav-link i {
          margin-right: 12px;
          width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          position: absolute;
          bottom: 0;
          width: 100%;
          border-top: 1px solid #34495e;
        }

        .logout {
          color: #e74c3c !important;
        }

        .logout:hover {
          background-color: #c0392b !important;
          color: white !important;
        }

        /* Main Content */
        .main-content {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100vh;
          overflow-y: auto;
          padding: 0px 20px 0px 20px;
          transition: margin-left 0.3s ease;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
          margin-top: 10px;
        }

        .header h1 {
          font-size: 28px;
          color: #2c3e50;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #2c3e50;
          padding: 5px;
          border-radius: 4px;
        }

        .mobile-menu-toggle:hover {
          background-color: #f0f0f0;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .sidebar-overlay.active {
          display: block;
        }

        /* Responsive Design */
        @media (min-width: 992px) {
          .sidebar {
            transform: translateX(0) !important;
            position: relative;
          }
          
          .main-content {
            margin-left: 0;
            width: calc(100% - 250px);
          }
        }

        @media (max-width: 991px) {
          .sidebar {
            width: 250px;
            transform: translateX(-100%);
            position: fixed;
            top: 0;
            left: 0;
          }
          
          .sidebar.active {
            transform: translateX(0);
          }
          
          .main-content {
            width: 100%;
            margin-left: 0;
            padding: 0 15px;
          }
          
          .mobile-menu-toggle {
            display: block;
          }
          
          .sidebar-overlay.active {
            display: block;
          }
          
          .sidebar-header .sidebar-toggle {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 100%;
            border-radius: 0;
          }
          
          .main-content {
            padding: 0 10px;
          }
          
          .header {
            
            gap: 15px;
            align-items: flex-start;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
    </style>
</head>
<body>
    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <h2>Admin System</h2>
            <button class="sidebar-toggle" onclick="toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
        </div>

        <nav class="sidebar-nav">
            <a href="dashboard.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'dashboard.php' ? 'active' : ''; ?>">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </a>
            <a href="produtos.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'produtos.php' ? 'active' : ''; ?>">
                <i class="fas fa-box"></i>
                <span>Produtos</span>
            </a>
            <a href="categorias.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'categorias.php' ? 'active' : ''; ?>">
                <i class="fas fa-folder-open"></i>
                <span>Categorias</span>
            </a>
            <a href="mesas.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'mesas.php' ? 'active' : ''; ?>">
                <i class="fas fa-chair"></i>
                <span>Mesas</span>
            </a>
            <a href="relatorios.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'relatorios.php' ? 'active' : ''; ?>">
                <i class="fas fa-chart-bar"></i>
                <span>Relatórios</span>
            </a>
            <a href="funcionarios.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'funcionarios.php' ? 'active' : ''; ?>">
                <i class="fas fa-users"></i>
                <span>Funcionários</span>
            </a>
           
        </nav>

        <div class="sidebar-footer">
            <a href="api/logout.php" class="nav-link logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Sair</span>
            </a>
        </div>
    </div>

    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            const mainContent = document.getElementById('mainContent');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');

            if (sidebar.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    toggleSidebar();
                }
            });
        });
        
        window.addEventListener('resize', () => {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            
            if (window.innerWidth >= 992) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    </script>
</body>
</html>