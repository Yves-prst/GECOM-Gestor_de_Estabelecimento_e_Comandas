# GECOM – Gestor de Estabelecimento e Comandas

Trabalho de Conclusão de Curso – Técnico em Informática  
Instituto Federal do Paraná – Campus Pinhais  
Ano: 2025

---

## 📌 Sobre o Projeto

O **GECOM (Gestor de Estabelecimento e Comandas)** é um sistema integrado desenvolvido para auxiliar restaurantes de pequeno e médio porte no gerenciamento de comandas, pedidos e operações administrativas.

O sistema foi criado para substituir processos manuais, como comandas de papel, reduzindo falhas de comunicação entre atendimento e cozinha, otimizando o fluxo de trabalho e oferecendo maior controle administrativo.

O projeto é composto por **três módulos integrados**, que se comunicam por meio de uma API e um banco de dados centralizado.

---

## 🎯 Objetivo

Desenvolver um sistema integrado de gerenciamento de comandas que:

- Otimize o fluxo de atendimento
- Reduza erros operacionais
- Melhore a comunicação entre salão, cozinha e administração
- Forneça dados confiáveis para gestão e tomada de decisão

---

## 🧩 Estrutura do Sistema

O GECOM é dividido em três módulos principais:

### 1. Sistema Administrativo (Web)

Módulo voltado à gestão do estabelecimento.

**Funcionalidades:**
- Cadastro e gerenciamento de produtos
- Gerenciamento de categorias e adicionais
- Cadastro de funcionários e controle de permissões
- Gerenciamento de mesas
- Relatórios de vendas (diários, semanais e mensais)
- Acompanhamento de metas e indicadores

**Tecnologias:**
- HTML
- CSS
- JavaScript
- PHP
- MySQL

---

### 2. Sistema Mobile – Garçom

Aplicação utilizada pelos garçons para o atendimento direto ao cliente.

**Funcionalidades:**
- Autenticação de usuários
- Abertura de comandas por mesa
- Registro de pedidos com adicionais
- Envio automático dos pedidos
- Acompanhamento do status do pedido
- Encerramento de comandas

**Tecnologias:**
- React Native
- JavaScript
- Node.js
- Express
- Axios
- Expo

---

### 3. Visor da Cozinha (KDS)

Módulo responsável pela exibição dos pedidos na cozinha.

**Funcionalidades:**
- Recebimento automático dos pedidos
- Exibição organizada por status
- Controle manual de andamento (novo, em preparo, pronto)
- Atualização em tempo real

**Tecnologias:**
- HTML
- CSS
- JavaScript
- Node.js

---

## 🔗 Integração entre os Módulos

Os módulos se comunicam por meio de uma **API REST**, utilizando **JSON** como formato de troca de dados.

- O **banco de dados MySQL** centraliza todas as informações
- O **Node.js** atua como intermediário na comunicação em tempo real
- O sistema opera prioritariamente em **rede local**, garantindo estabilidade e baixo custo

---

## 🗄️ Banco de Dados

O banco de dados foi modelado de forma relacional e inclui tabelas como:

- `users` – usuários e permissões
- `categories` – categorias de produtos
- `category_addons` – adicionais por categoria
- `products` – produtos do cardápio
- `mesas` – controle de mesas
- `orders` – comandas
- `order_items` – itens do pedido
- `order_item_addons` – adicionais por item
- `sales` – vendas realizadas
- `goals` – metas financeiras

Essa estrutura garante integridade, organização e suporte a relatórios administrativos.

---

## ⚙️ Requisitos para Execução

### Ambiente de Desenvolvimento
- Windows
- WampServer (Apache + PHP + MySQL)
- Node.js
- MySQL
- Visual Studio Code

### Execução
1. Iniciar os serviços **Apache** e **MySQL**
2. Importar o banco de dados no MySQL
3. Executar o sistema **Web Administrativo** via navegador
4. Iniciar o backend do aplicativo mobile (Node.js):
   ```bash
   node server
5. Executar o aplicativo mobile via Expo:
   ```bash
   npx expo start
6. Acessar o aplicativo mobile por meio do Expo Web (navegador)
7. Acessar o KDS (Kitchen Display System) em navegador dedicado

Todos os módulos devem estar conectados à mesma rede.

---

## 📊 Resultados Obtidos

Durante os testes realizados em ambiente real:

- Redução média de **50% no tempo de atendimento**
- Eliminação de erros de anotação manual
- Fechamento de caixa reduzido de cerca de **30 minutos para poucos segundos**
- Melhoria significativa na organização e comunicação interna

---

## 🚧 Limitações Identificadas

- Dificuldades iniciais na sincronização entre app e sistema web
- Dependência de rede local
- Ausência de hospedagem em nuvem na versão atual

---

## 🔮 Trabalhos Futuros

- Controle automatizado de estoque
- Integração com meios de pagamento
- Hospedagem em nuvem
- Versão compatível com iOS
- Dashboards gerenciais mais avançados

---

## 👨‍💻 Autores

- **Igor Henrique dos Santos Borges**  
  Desenvolvimento Full Stack e Documentação  

- **Yves Pereira dos Santos**  
  Desenvolvimento Full Stack e Documentação  

---

## 📄 Documentação

A documentação completa do projeto está disponível na pasta: /Documentação


Ela contém:
- Fundamentação teórica
- Metodologia
- Modelagem do sistema
- Avaliação prática
- Resultados e conclusões

---

## 📎 Licença

Projeto acadêmico desenvolvido como Trabalho de Conclusão de Curso.  

