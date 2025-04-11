# GECOM - Gestor de Estabelecimento e Comandas
TCC Curso Técnico em Informática - IFPR Campus Pinhais 2025

# 🍽️ GECOM – Sistema de Gerenciamento de Comandas

*GECOM* é um sistema de gerenciamento de comandas que auxilia o atendimento em restaurantes e similares. Ele agiliza o registro de pedidos, facilita a divisão de contas e otimiza a gestão do estabelecimento. Com funcionalidades como cadastro de produtos, fechamento de venda diária e mais, o sistema de comandas melhora a agilidade do atendente e aumenta a eficiência do serviço. 

---

## 🚀 O que é o GECOM?

O GECOM (Gestor de Estabelecimento e Comandas) é um sistema pensado para **restaurantes, bares, lanchonetes e similares**, com o objetivo de:

- Agilizar o registro de pedidos
- Organizar o fechamento de contas
- Dividir pagamentos de forma prática
- Gerenciar produtos e usuários
- Otimizar a rotina do estabelecimento como um todo

---

## 🎨 Identidade Visual

*Paleta de Cores – Maré Noturna:*

| Cor           | Código Hex |
|---------------|------------|
| Azul Petróleo Profundo     | #021B33  |
| Azul Céu Profundo   | #12577B  |
| Branco Neve  | #F7F7F7  |
| Azul Bebê Claro | #A9CFE5  |


---

## 📦 Escopo do Produto

Funcionalidades Principais:

- ✅ Cadastro de produtos (nome, preço e categoria)
- ✅ Criação de comandas por cliente ou mesa
- ✅ Registro e edição de pedidos em tempo real
- ✅ Cálculo automático de totais (e divisão entre clientes)
- ✅ Geração de relatório diário de vendas 💰
- ✅ Login individual de atendentes
- ✅ Histórico e status de comandas

Critérios de Aceite:

- ✅ Compatível com desktops e dispositivos móveis 📱
- ✅ Interface intuitiva, leve e rápida

---

## 🎯 Públco Alvo

- **Pessoas que trabalham em restaurantes e comércios alimentícios no geral**

---

## 🔐 Controle de Acesso

Cada usuário tem acesso somente ao que precisa:

- **Atendentes**: criam e editam comandas
- **Cozinha**: visualiza pedidos em tempo real
- **Gerência/Admins**: gerencia produtos, usuários e relatórios

---

## ⚙️ Informações Técnicas

- **Backend**: PHP
- **Banco de Dados**: MySQL
- **Frontend**: HTML, CSS e JavaScript
- **Compatibilidade**: Windows, tablets e smartphones

---

👥 Quem fez?

Este projeto foi desenvolvido por:

-**Igor Henrique dos Santos Borges** - **Desenvolvedor Full-Stack e documentação**

-**Yves Pereira dos Santos** - **Desenvolvedor Full-Stack e documentação**

---

📌 Observações

Produtos inativos não podem ser adicionados às comandas.

As alterações são sincronizadas em tempo real entre os dispositivos.

---

## ⚠ Matriz de Riscos

| **Id Risco** | **Descrição do Risco**                                                                 | **Probabilidade** | **Impacto** | **Plano de Resposta**                                                                 | **Status do Risco**     |
|--------------|------------------------------------------------------------------------------------------|-------------------|-------------|----------------------------------------------------------------------------------------|--------------------------|
| R1           | Atraso na entrega das funcionalidades essenciais (REF01 a REF06)                        | Média             | Alto        | Priorizar funcionalidades principais, cronograma ágil com entregas incrementais       | Em monitoramento         |
| R2           | Cálculos incorretos nas comandas (REF05, RNE05)                                         | Baixa             | Alto        | Testes automatizados, validação com dados reais e simulações de uso                   | Controlado       |
| R3           | Falhas no controle de acesso e permissões (REF07, RNE02)                                | Média             | Alto        | Implementar autenticação segura e testes de nível de acesso                           | Em desenvolvimento               |
| R4           | Problemas de visualização em dispositivos móveis (RNF06, REF09)                         | Baixa              | Médio       | Uso de design responsivo e testes com diferentes tamanhos de tela                     | Controlado              |
| R5           | Baixa usabilidade da interface (RNF08, REF10)                                           | Média             | Médio       | Realizar testes com usuários e aplicar feedbacks de usabilidade                       | Em melhoria     |
| R6           | Perda de dados por falha ou desligamento inesperado (RNF01, RNF02)                      | Alta             | Alto        | Implementar backups automáticos e recuperação de sessão                               | Controlado               |
| R7           | Problemas na sincronização entre dispositivos (RNE08)                                   | Alta             | Alto        | Implementar WebSocket ou mecanismo de sincronização em tempo real confiável          | Em desenvolvimento       |
| R8           | Cadastro incorreto de produtos ou comandas (REF01, REF02, RNE03)                        | Baixa             | Médio       | Validação de entrada e alertas de erro visuais                                        | Em análise               |

