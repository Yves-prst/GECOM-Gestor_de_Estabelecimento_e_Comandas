const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors({
  origin: '*' 
}));
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'admin_system3',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API do Sistema de Restaurante',
    endpoints: {
      mesas: '/api/mesas',
      categories: '/api/categories',
      products: '/api/products'
    }
  });
});

app.get('/api/mesas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mesas');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar mesas' });
  }
});

app.put('/api/mesas/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await pool.query('UPDATE mesas SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status da mesa' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        CAST(p.price AS DECIMAL(10,2)) as price, 
        p.category_id,
        c.name as category_name,
        p.status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'Ativo'
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.get('/api/products/by-category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  
  try {
    const [rows] = await pool.query(`
      SELECT * FROM products 
      WHERE category_id = ? AND status = 'Ativo'
    `, [categoryId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos por categoria' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { mesaId, items } = req.body;
  
  try {
    // Inicia uma transação
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    
    try {

      const [orderResult] = await conn.query(
        'INSERT INTO orders (status, total) VALUES (?, ?)',
        ['open', items.reduce((sum, item) => sum + (item.price * item.quantity), 0)]
      );
      
      const orderId = orderResult.insertId;

      for (const item of items) {
        await conn.query(
          'INSERT INTO sales (product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [item.productId, item.name, item.quantity, item.price, (item.price * item.quantity)]
        );
      }
    
      await conn.query('UPDATE mesas SET status = ? WHERE id = ?', ['ocupada', mesaId]);
      
      await conn.commit();
      res.json({ success: true, orderId });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});