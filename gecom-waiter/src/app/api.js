import axios from 'axios';
import { EventSourcePolyfill } from 'event-source-polyfill';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

const setupSSEListener = (endpoint, callback) => {
  const eventSource = new EventSourcePolyfill(`${api.defaults.baseURL}${endpoint}/sse`, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  });

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };

  eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    eventSource.close();
  };

  return () => eventSource.close();
};

export const fetchTables = () => api.get('/mesas');
export const updateTableStatus = (id, status) => api.put(`/mesas/${id}/status`, { status });
export const fetchCategories = () => api.get('/categories');
export const fetchProducts = () => api.get('/products');
export const fetchProductsByCategory = (categoryId) => api.get(`/products/by-category/${categoryId}`);
export const createOrder = (mesaId, items) => api.post('/orders', { mesaId, items });

export const listenForTablesUpdates = (callback) => setupSSEListener('/mesas', callback);
export const listenForProductsUpdates = (callback) => setupSSEListener('/products', callback);
export const listenForCategoriesUpdates = (callback) => setupSSEListener('/categories', callback);

export default api;