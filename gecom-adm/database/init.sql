-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS admin_system;
USE admin_system;

INSERT IGNORE INTO categories (name, description) VALUES 
('Lanches', 'Hambúrguers, sanduíches e similares'),
('Bebidas', 'Refrigerantes, sucos e bebidas em geral'),
('Sobremesas', 'Doces, sorvetes e sobremesas'),
('Acompanhamentos', 'Batatas, saladas e acompanhamentos');

INSERT IGNORE INTO products (name, price, status, category_id) VALUES 
('Hambúrguer Especial', 15.00, 'Ativo', 1),
('Pizza Margherita', 18.50, 'Ativo', 1),
('Refrigerante Lata', 3.00, 'Ativo', 2),
('Batata Frita Grande', 8.00, 'Ativo', 4),
('Sorvete Chocolate', 5.00, 'Ativo', 3),
('Suco Natural', 4.50, 'Ativo', 2),
('Hambúrguer Simples', 12.00, 'Ativo', 1),
('Torta de Limão', 6.00, 'Ativo', 3);

INSERT IGNORE INTO sales (product_name, quantity, unit_price, total_price, sale_date) VALUES 
('Hambúrguer Especial', 2, 15.00, 30.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Refrigerante Lata', 3, 3.00, 9.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Pizza Margherita', 1, 18.50, 18.50, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Batata Frita Grande', 2, 8.00, 16.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Sorvete Chocolate', 1, 5.00, 5.00, DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT IGNORE INTO orders (status, total, created_at, closed_at) VALUES 
('closed', 57.50, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 2 HOUR),
('closed', 34.50, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 1 HOUR),
('open', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL),
('open', 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL);

INSERT IGNORE INTO highlights (title, description, value, type) VALUES 
('Meta Mensal Atingida', 'Parabéns! A meta de vendas deste mês foi atingida com sucesso.', 2500.00, 'goal'),
('Produto Mais Vendido', 'O produto "Hambúrguer Especial" foi o mais vendido esta semana.', 450.00, 'product'),
('Melhor Dia de Vendas', 'Ontem foi registrado o melhor dia de vendas do mês.', 890.50, 'sale');
