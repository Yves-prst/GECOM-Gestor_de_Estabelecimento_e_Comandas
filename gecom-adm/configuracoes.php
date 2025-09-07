<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/style.css?v=1.2">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">


    <title>Configurações - Sistema Administrativo</title>
</head>

<body>

    <?php include 'includes/sidebar.php'; ?>
    <button class="mobile-menu-toggle" onclick="toggleSidebar()" style="margin:5px ; height: 20px; position: absolute;">
        <i class="fas fa-bars"></i>
    </button>

    <div class="main-content">

        <div class="header">
            <h1>Configurações</h1>
        </div>

        <div class="form-group" id="form-config">

            <form class="info-system">
                <h1>Informações do Estabelecimento</h1>

                <p>Nome</p>
                <input type="text" name="nome">

                <p>Endereço</p>
                <input type="text" name="endereco">

                <p>Telefone</p>
                <input type="tel" name="telefone">

                <div class="form-actions">
                    <input class="btn-primary" type="submit" value="Salvar">
                </div>
            </form>

            <form class="config-system">
                <h1>Configurações do Sistema</h1>

                <p>Taxa de Serviço</p>
                <input type="text" name="taxa_servico">

                <p>Horário de Abertura</p>
                <input type="text" name="abertura">

                <p>Horário de Fechamento</p>
                <input type="text" name="fechamento">

                <div class="form-actions">
                    <input class="btn-primary" type="submit" value="Salvar">
                </div>
            </form>

        </div>



    </div>

</body>

</html>