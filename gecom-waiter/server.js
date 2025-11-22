const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const app = express();
const port = 3001;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "admin_system3",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const clients = {
  tables: [],
  products: [],
  categories: [],
  orders: [],
};

function sendToClients(clientType, data) {
  console.log(
    `Enviando para ${clients[clientType].length} clientes (${clientType}):`,
    data.type
  );
  clients[clientType].forEach((client) => {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error("Erro ao enviar para cliente:", error);
    }
  });
}

function setupSseRoute(path, clientType) {
  app.get(path, (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients[clientType].push(newClient);
    console.log(
      `Novo cliente conectado para ${clientType}. Total: ${clients[clientType].length}`
    );

    const heartbeat = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch (error) {
        clearInterval(heartbeat);
      }
    }, 30000);

    req.on("close", () => {
      clearInterval(heartbeat);
      clients[clientType] = clients[clientType].filter(
        (c) => c.id !== clientId
      );
      console.log(
        `Cliente ${clientType} desconectado. Restantes: ${clients[clientType].length}`
      );
    });
  });
}

setupSseRoute("/api/mesas/sse", "tables");
setupSseRoute("/api/products/sse", "products");
setupSseRoute("/api/categories/sse", "categories");
setupSseRoute("/api/orders/sse", "orders");

// --- FUNÇÃO AUXILIAR PARA BUSCAR MESA ---
async function getMesaIdByOrder(orderId) {
  try {
    const [rows] = await pool.query(
      "SELECT mesa_id FROM mesa_orders WHERE order_id = ?",
      [orderId]
    );
    return rows.length > 0 ? rows[0].mesa_id : null;
  } catch (e) {
    return null;
  }
}

async function registerSales(orderId, conn) {
  try {
    console.log(`[DEBUG] Registrando vendas para pedido: ${orderId}`);

    const [orderItems] = await conn.query(
      `
      SELECT 
        oi.id,
        oi.product_id, 
        oi.product_name, 
        oi.quantity, 
        oi.price_at_order
      FROM order_items oi
      WHERE oi.order_id = ?
    `,
      [orderId]
    );

    let totalSales = 0;

    for (const item of orderItems) {
      const productId = item.product_id;
      const productName = item.product_name;
      const quantity = item.quantity;
      const unitPrice = Number(item.price_at_order) || 0;
      const totalPrice = unitPrice * quantity;

      totalSales += totalPrice;

      await conn.query(
        "INSERT INTO sales (product_id, product_name, quantity, unit_price, total_price, sale_date) VALUES (?, ?, ?, ?, ?, NOW())",
        [productId, productName, quantity, unitPrice, totalPrice]
      );
    }
  } catch (error) {
    console.error("Erro ao registrar vendas:", error);
    throw error;
  }
}

app.get("/api/mesas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM mesas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar mesas" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
});

app.get("/api/products-with-addons", async (req, res) => {
  try {
    const [results] = await pool.execute(`
            SELECT p.*, ca.id AS addon_id, ca.name AS addon_name, ca.price AS addon_price
            FROM products p
            LEFT JOIN category_addons ca ON p.category_id = ca.category_id
            WHERE p.status = 'Ativo'
        `);
    const productsMap = {};
    results.forEach((row) => {
      if (!productsMap[row.id]) {
        productsMap[row.id] = { ...row, allExtras: [] };
      }
      if (row.addon_id) {
        const existingAddon = productsMap[row.id].allExtras.find(
          (a) => a.id === row.addon_id
        );
        if (!existingAddon) {
          productsMap[row.id].allExtras.push({
            id: row.addon_id,
            name: row.addon_name,
            price: Number(row.addon_price),
          });
        }
      }
    });
    res.json(Object.values(productsMap));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

app.post("/api/products", async (req, res) => {
  const productData = req.body;
  try {
    const [result] = await pool.query("INSERT INTO products SET ?", [
      productData,
    ]);
    sendToClients("products", {
      type: "PRODUCT_CREATED",
      data: { id: result.insertId, name: productData.name },
    });
    res.json({
      success: true,
      id: result.insertId,
      message: "Produto criado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  try {
    await pool.query("UPDATE products SET ? WHERE id = ?", [productData, id]);
    sendToClients("products", {
      type: "PRODUCT_UPDATED",
      data: { id, name: productData.name },
    });
    res.json({
      success: true,
      message: `Produto ${id} atualizado com sucesso.`,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

app.post("/api/categories", async (req, res) => {
  const categoryData = req.body;
  try {
    const [result] = await pool.query("INSERT INTO categories SET ?", [
      categoryData,
    ]);
    sendToClients("categories", {
      type: "CATEGORY_CREATED",
      data: { id: result.insertId, name: categoryData.name },
    });
    res.json({
      success: true,
      id: result.insertId,
      message: "Categoria criada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
});

app.post("/api/category-addons", async (req, res) => {
  const addonData = req.body;
  try {
    const [result] = await pool.query("INSERT INTO category_addons SET ?", [
      addonData,
    ]);
    sendToClients("products", {
      type: "ADDON_CREATED",
      data: { id: result.insertId, name: addonData.name },
    });
    res.json({
      success: true,
      id: result.insertId,
      message: "Adicional criado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao criar adicional:", error);
    res.status(500).json({ error: "Erro ao criar adicional" });
  }
});

app.put("/api/category-addons/:id", async (req, res) => {
  const { id } = req.params;
  const addonData = req.body;
  try {
    await pool.query("UPDATE category_addons SET ? WHERE id = ?", [
      addonData,
      id,
    ]);
    sendToClients("products", {
      type: "ADDON_UPDATED",
      data: { id, name: addonData.name },
    });
    res.json({
      success: true,
      message: `Adicional ${id} atualizado com sucesso.`,
    });
  } catch (error) {
    console.error("Erro ao atualizar adicional:", error);
    res.status(500).json({ error: "Erro ao atualizar adicional" });
  }
});

app.delete("/api/category-addons/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM category_addons WHERE id = ?", [id]);
    sendToClients("products", {
      type: "ADDON_DELETED",
      data: { id },
    });
    res.json({
      success: true,
      message: `Adicional ${id} excluído com sucesso.`,
    });
  } catch (error) {
    console.error("Erro ao excluir adicional:", error);
    res.status(500).json({ error: "Erro ao excluir adicional" });
  }
});

app.put("/api/orders/:orderId/replace-items", async (req, res) => {
  const { orderId } = req.params;
  const { items } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      "DELETE FROM order_item_addons WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = ?)",
      [orderId]
    );
    await conn.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);

    let totalOrderPrice = 0;

    for (const item of items) {
      const itemBasePrice = Number(item.price) || 0;
      const extrasTotal = (item.extras || []).reduce(
        (sum, extra) => sum + (Number(extra.price) || 0),
        0
      );
      const priceAtOrder = itemBasePrice + extrasTotal;
      const itemTotalPrice = priceAtOrder * item.quantity;
      totalOrderPrice += itemTotalPrice;

      const [itemResult] = await conn.query(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_order) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.productId, item.name, item.quantity, priceAtOrder]
      );
      const orderItemId = itemResult.insertId;

      for (const extra of item.extras || []) {
        await conn.query(
          "INSERT INTO order_item_addons (order_item_id, addon_id, price_at_order) VALUES (?, ?, ?)",
          [orderItemId, extra.id, extra.price]
        );
      }
    }

    await conn.query("UPDATE orders SET total = ? WHERE id = ?", [
      totalOrderPrice,
      orderId,
    ]);

    const mesaId = await getMesaIdByOrder(orderId);
    await conn.commit();

    sendToClients("orders", {
      type: "ORDER_REPLACED",
      data: {
        orderId,
        itemCount: items.length,
        total: totalOrderPrice,
        mesaId,
      },
    });

    res.json({ success: true, orderId, total: totalOrderPrice });
  } catch (error) {
    await conn.rollback();
    console.error("Erro ao substituir itens do pedido:", error);
    res.status(500).json({ error: "Erro ao substituir itens do pedido" });
  } finally {
    conn.release();
  }
});

app.post("/api/orders", async (req, res) => {
  const { mesaId, items } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orderResult] = await conn.query(
      "INSERT INTO orders (status, total) VALUES (?, ?)",
      ["open", 0]
    );
    const orderId = orderResult.insertId;
    await conn.query(
      "INSERT INTO mesa_orders (mesa_id, order_id) VALUES (?, ?)",
      [mesaId, orderId]
    );

    let totalOrderPrice = 0;
    for (const item of items) {
      const itemBasePrice = Number(item.price) || 0;
      const extrasTotal = (item.extras || []).reduce(
        (sum, extra) => sum + (Number(extra.price) || 0),
        0
      );
      const priceAtOrder = itemBasePrice + extrasTotal;
      const itemTotalPrice = priceAtOrder * item.quantity;
      totalOrderPrice += itemTotalPrice;

      const [itemResult] = await conn.query(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_order) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.productId, item.name, item.quantity, priceAtOrder]
      );
      const orderItemId = itemResult.insertId;

      for (const extra of item.extras || []) {
        await conn.query(
          "INSERT INTO order_item_addons (order_item_id, addon_id, price_at_order) VALUES (?, ?, ?)",
          [orderItemId, extra.id, extra.price]
        );
      }
    }

    await conn.query("UPDATE orders SET total = ? WHERE id = ?", [
      totalOrderPrice,
      orderId,
    ]);

    await conn.query("UPDATE mesas SET status = ? WHERE id = ?", [
      "ocupada",
      mesaId,
    ]);

    await conn.commit();

    sendToClients("orders", { type: "NEW_ORDER", data: { orderId, mesaId } });
    sendToClients("tables", {
      type: "TABLE_STATUS_UPDATE",
      data: { mesaId, status: "ocupada" },
    });

    res.json({ success: true, orderId });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pedido" });
  } finally {
    conn.release();
  }
});

app.post("/api/orders/:orderId/add-items", async (req, res) => {
  const { orderId } = req.params;
  const { items } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.query(
      "SELECT total FROM orders WHERE id = ?",
      [orderId]
    );
    if (orderRows.length === 0) {
      throw new Error("Order not found");
    }
    let totalOrderPrice = Number(orderRows[0].total);

    for (const item of items) {
      const itemBasePrice = Number(item.price) || 0;
      const extrasTotal = (item.extras || []).reduce(
        (sum, extra) => sum + (Number(extra.price) || 0),
        0
      );
      const priceAtOrder = itemBasePrice + extrasTotal;
      const itemTotalPrice = priceAtOrder * item.quantity;
      totalOrderPrice += itemTotalPrice;

      const [itemResult] = await conn.query(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_order) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.productId, item.name, item.quantity, priceAtOrder]
      );
      const orderItemId = itemResult.insertId;

      for (const extra of item.extras || []) {
        await conn.query(
          "INSERT INTO order_item_addons (order_item_id, addon_id, price_at_order) VALUES (?, ?, ?)",
          [orderItemId, extra.id, extra.price]
        );
      }
    }

    await conn.query("UPDATE orders SET total = ? WHERE id = ?", [
      totalOrderPrice,
      orderId,
    ]);

    const mesaId = await getMesaIdByOrder(orderId);
    await conn.commit();

    sendToClients("orders", {
      type: "ORDER_UPDATED",
      data: { orderId, mesaId },
    });

    res.json({ success: true, orderId });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar itens ao pedido" });
  } finally {
    conn.release();
  }
});

app.get("/api/orders/open/:tableId", async (req, res) => {
  const { tableId } = req.params;
  try {
    const [rows] = await pool.query(
      `
        SELECT 
          o.id, o.status, o.created_at, o.total,
          oi.id AS item_id, oi.product_id, oi.quantity, 
          oi.price_at_order, oi.notes,
          p.name AS product_name,
          oia.addon_id,
          ca.name AS addon_name, 
          oia.price_at_order AS addon_price
        FROM orders o
        JOIN mesa_orders mo ON o.id = mo.order_id
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN order_item_addons oia ON oi.id = oia.order_item_id
        LEFT JOIN category_addons ca ON oia.addon_id = ca.id
        WHERE mo.mesa_id = ? AND o.status != 'closed'
        ORDER BY oi.id
    `,
      [tableId]
    );

    if (rows.length === 0) return res.json({ order: null });

    const order = {
      id: rows[0].id,
      status: rows[0].status,
      created_at: rows[0].created_at,
      total: parseFloat(rows[0].total),
      items: [],
    };

    const itemsMap = new Map();

    rows.forEach((row) => {
      if (!itemsMap.has(row.item_id)) {
        itemsMap.set(row.item_id, {
          id: row.item_id,
          product_id: row.product_id,
          name: row.product_name,
          price: parseFloat(row.price_at_order),
          quantity: row.quantity,
          notes: row.notes,
          addons: [],
        });
      }

      if (row.addon_id && row.addon_name) {
        const existingAddon = itemsMap
          .get(row.item_id)
          .addons.find((addon) => addon.id === row.addon_id);

        if (!existingAddon) {
          itemsMap.get(row.item_id).addons.push({
            id: row.addon_id,
            name: row.addon_name,
            price: parseFloat(row.addon_price),
          });
        }
      }
    });

    order.items = Array.from(itemsMap.values());
    res.json({ order });
  } catch (error) {
    console.error("Erro ao buscar pedido aberto:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/mesas/:mesaId/close-order", async (req, res) => {
  const { mesaId } = req.params;
  const { paymentMethod } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.execute(
      `SELECT order_id FROM mesa_orders WHERE mesa_id = ?`,
      [mesaId]
    );

    if (orderRows.length === 0) {
      throw new Error("Nenhum pedido para esta mesa.");
    }

    const orderId = orderRows[0].order_id;
    await registerSales(orderId, conn);

    await conn.execute(
      `UPDATE orders SET status = 'closed', payment_method = ?, paid_at = NOW(), closed_at = NOW() WHERE id = ?`,
      [paymentMethod || "Dinheiro", orderId]
    );

    await conn.execute(`UPDATE mesas SET status = 'disponivel' WHERE id = ?`, [
      mesaId,
    ]);

    await conn.execute(`DELETE FROM mesa_orders WHERE mesa_id = ?`, [mesaId]);

    await conn.commit();

    sendToClients("orders", {
      type: "ORDER_CLOSED",
      data: { orderId, mesaId },
    });

    sendToClients("tables", {
      type: "TABLE_STATUS_UPDATE",
      data: { mesaId, status: "disponivel" },
    });

    res.json({ message: "Mesa fechada com sucesso." });
  } catch (error) {
    await conn.rollback();
    console.error("Erro ao fechar mesa:", error);
    res.status(500).json({ error: "Erro ao finalizar o pedido." });
  } finally {
    conn.release();
  }
});

// --- ROTAS DE STATUS DA COZINHA (ATUALIZADAS COM MESA_ID) ---

app.put("/api/orders/:orderId/send-to-kitchen", async (req, res) => {
  const { orderId } = req.params;
  try {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [
      "sent_to_kitchen",
      orderId,
    ]);

    const mesaId = await getMesaIdByOrder(orderId);

    sendToClients("orders", {
      type: "ORDER_STATUS_UPDATE",
      data: { orderId, status: "sent_to_kitchen", mesaId },
    });
    res.json({ success: true, message: "Pedido enviado para a cozinha" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao enviar pedido" });
  }
});

app.put("/api/orders/:orderId/start-preparing", async (req, res) => {
  const { orderId } = req.params;
  try {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [
      "preparing",
      orderId,
    ]);

    const mesaId = await getMesaIdByOrder(orderId);

    sendToClients("orders", {
      type: "ORDER_STATUS_UPDATE",
      data: { orderId, status: "preparing", mesaId },
    });
    res.json({ success: true, message: "Preparo do pedido iniciado" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao iniciar preparo" });
  }
});

app.put("/api/orders/:orderId/mark-ready", async (req, res) => {
  const { orderId } = req.params;
  try {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [
      "ready",
      orderId,
    ]);

    const mesaId = await getMesaIdByOrder(orderId);

    sendToClients("orders", {
      type: "ORDER_STATUS_UPDATE",
      data: { orderId, status: "ready", mesaId },
    });
    res.json({ success: true, message: "Pedido marcado como pronto" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Erro ao marcar como pronto" });
  }
});

app.get("/api/kitchen/orders", async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.id, o.status, o.created_at, GROUP_CONCAT(DISTINCT m.numero) as mesas
      FROM orders o
      LEFT JOIN mesa_orders mo ON o.id = mo.order_id
      LEFT JOIN mesas m ON mo.mesa_id = m.id
      WHERE o.status IN ('sent_to_kitchen', 'preparing', 'ready')
      GROUP BY o.id ORDER BY o.created_at ASC
    `);
    for (let order of orders) {
      const [items] = await pool.query(
        `
        SELECT oi.product_name, oi.quantity, GROUP_CONCAT(ca.name SEPARATOR ', ') as addons
        FROM order_items oi
        LEFT JOIN order_item_addons oia ON oi.id = oia.order_item_id
        LEFT JOIN category_addons ca ON oia.addon_id = ca.id
        WHERE oi.order_id = ? GROUP BY oi.id
      `,
        [order.id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pedidos da cozinha" });
  }
});

const bcrypt = require("bcryptjs");

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND cargo = 'garcom'",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado ou não é garçom.",
      });
    }

    const user = users[0];
    let isPasswordValid = false;

    if (user.password.startsWith("$2y$")) {
      const bcryptHash = user.password.replace("$2y$", "$2a$");
      isPasswordValid = await bcrypt.compare(password, bcryptHash);
    } else {
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Senha incorreta.",
      });
    }

    const { password: _ignored, ...userData } = user;

    res.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
});

app.get("/api/check-auth", async (req, res) => {
  res.json({
    authenticated: false,
    user: null,
  });
});

app.post("/api/logout", (req, res) => {
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
