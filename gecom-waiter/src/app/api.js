import axios from "axios";
import { EventSourcePolyfill } from "event-source-polyfill";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

const activeConnections = {};

const setupSSEListener = (endpoint, callback) => {
  if (activeConnections[endpoint]) {
    activeConnections[endpoint].close();
  }

  const eventSource = new EventSourcePolyfill(
    `${api.defaults.baseURL}${endpoint}`,
    {
      headers: { "Cache-Control": "no-cache" },
      heartbeatTimeout: 3600000,
    }
  );

  activeConnections[endpoint] = eventSource;

  eventSource.onmessage = (event) => {
    try {
      if (event.data !== ": heartbeat") {
        const data = JSON.parse(event.data);
        callback(data);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem SSE:", error);
    }
  };

  eventSource.onerror = (error) => {
    console.error(`SSE Error (${endpoint}):`, error);
    eventSource.close();
    setTimeout(() => setupSSEListener(endpoint, callback), 3000);
  };

  return () => {
    if (activeConnections[endpoint]) {
      activeConnections[endpoint].close();
      delete activeConnections[endpoint];
    }
  };
};

export const fetchTables = () => api.get("/mesas");
export const updateTableStatus = (id, status) =>
  api.put(`/mesas/${id}/status`, { status });
export const fetchCategories = () => api.get("/categories");
export const fetchProductsByCategory = (categoryId) =>
  api.get(`/products/by-category/${categoryId}`);
export const createOrder = (mesaId, items) =>
  api.post("/orders", { mesaId, items });
export const addItemsToOrder = (orderId, items) =>
  api.post(`/orders/${orderId}/add-items`, { items });
// NOVA FUNÇÃO: Substituir todos os itens do pedido
export const replaceOrderItems = (orderId, items) =>
  api.put(`/orders/${orderId}/replace-items`, { items });
export const fetchProducts = () => api.get("/products-with-addons");
export const fetchOpenOrder = (tableId) => api.get(`/orders/open/${tableId}`);
export const closeTableAndOrder = (mesaId, paymentMethod) =>
  api.post(`/mesas/${mesaId}/close-order`, { paymentMethod });
export const createProduct = (productData) =>
  api.post("/products", productData);
export const updateProduct = (id, productData) =>
  api.put(`/products/${id}`, productData);
export const createCategory = (categoryData) =>
  api.post("/categories", categoryData);
export const createAddon = (addonData) =>
  api.post("/category-addons", addonData);
export const updateAddon = (id, addonData) =>
  api.put(`/category-addons/${id}`, addonData);
export const deleteAddon = (id) => api.delete(`/category-addons/${id}`);
export const sendOrderToKitchen = (orderId) =>
  api.put(`/orders/${orderId}/send-to-kitchen`);
export const startPreparingOrder = (orderId) =>
  api.put(`/orders/${orderId}/start-preparing`);
export const markOrderAsReady = (orderId) =>
  api.put(`/orders/${orderId}/mark-ready`);
export const fetchKitchenOrders = () => api.get("/kitchen/orders");
export const listenForTablesUpdates = (callback) =>
  setupSSEListener("/mesas/sse", callback);
export const listenForProductsUpdates = (callback) =>
  setupSSEListener("/products/sse", callback);
export const listenForCategoriesUpdates = (callback) =>
  setupSSEListener("/categories/sse", callback);
export const listenForOrdersUpdates = (callback) =>
  setupSSEListener("/orders/sse", callback);
export const closeAllSSEConnections = () => {
  Object.keys(activeConnections).forEach((endpoint) => {
    activeConnections[endpoint].close();
    delete activeConnections[endpoint];
  });
};

export default api;
