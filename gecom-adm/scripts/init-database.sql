INSERT OR IGNORE INTO categories (name, description) VALUES 
('Lanches', 'Hambúrguers, sanduíches e similares'),
('Bebidas', 'Refrigerantes, sucos e bebidas em geral'),
('Sobremesas', 'Doces, sorvetes e sobremesas'),
('Acompanhamentos', 'Batatas, saladas e acompanhamentos');

INSERT OR IGNORE INTO products (name, price, status, category_id) VALUES 
('Hambúrguer Especial', 15.00, 'Ativo', 1),
('Pizza Margherita', 18.50, 'Ativo', 1),
('Refrigerante Lata', 3.00, 'Ativo', 2),
('Batata Frita Grande', 8.00, 'Ativo', 4),
('Sorvete Chocolate', 5.00, 'Ativo', 3),
('Suco Natural', 4.50, 'Ativo', 2),
('Hambúrguer Simples', 12.00, 'Ativo', 1),
('Torta de Limão', 6.00, 'Ativo', 3);

INSERT OR IGNORE INTO sales (product_name, quantity, unit_price, total_price, sale_date) VALUES 
('Hambúrguer Especial', 2, 15.00, 30.00, datetime('now', '-1 day')),
('Refrigerante Lata', 3, 3.00, 9.00, datetime('now', '-1 day')),
('Pizza Margherita', 1, 18.50, 18.50, datetime('now', '-2 days')),
('Batata Frita Grande', 2, 8.00, 16.00, datetime('now', '-2 days')),
('Sorvete Chocolate', 1, 5.00, 5.00, datetime('now', '-3 days'));

INSERT OR IGNORE INTO orders (status, total, created_at, closed_at) VALUES 
('closed', 57.50, datetime('now', '-1 day'), datetime('now', '-1 day', '+2 hours')),
('closed', 34.50, datetime('now', '-2 days'), datetime('now', '-2 days', '+1 hour')),
('open', 0, datetime('now', '-1 hour'), NULL),
('open', 0, datetime('now', '-30 minutes'), NULL);
