// ================================================================
// SMRITA Frontend API Utility
// File: smrita/src/utils/api.js
// 
// SETUP: npm install axios   (run this in your smrita/ folder)
// ================================================================

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('smrita_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally — auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smrita_token');
      localStorage.removeItem('smrita_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── AUTH ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// ── PRODUCTS ──────────────────────────────────────────
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getFeatured: () => API.get('/products/featured'),
  getOne: (id) => API.get(`/products/${id}`),
  addReview: (id, data) => API.post(`/products/${id}/reviews`, data),
  // Admin
  create: (formData) => API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/products/${id}`),
};

// ── ORDERS ───────────────────────────────────────────
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my-orders'),
  getOne: (id) => API.get(`/orders/${id}`),
  cancel: (id) => API.put(`/orders/${id}/cancel`),
  // Admin
  getAll: (params) => API.get('/orders/admin/all', { params }),
  getStats: () => API.get('/orders/admin/stats'),
  updateStatus: (id, data) => API.put(`/orders/admin/${id}/status`, data),
};

// ── CONTACT ──────────────────────────────────────────
export const contactAPI = {
  submit: (data) => API.post('/contact', data),
  getAll: (params) => API.get('/contact', { params }),       // Admin
  markRead: (id) => API.put(`/contact/${id}/read`),          // Admin
};

// ── PAYMENT ──────────────────────────────────────────
export const paymentAPI = {
  createOrder: (amount) => API.post('/payment/create-order', { amount }),
  verify: (data) => API.post('/payment/verify', data),
};

// ── WISHLIST ─────────────────────────────────────────
export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  toggle: (productId) => API.post(`/wishlist/toggle/${productId}`),
  clear: () => API.delete('/wishlist/clear'),
};

export default API;
