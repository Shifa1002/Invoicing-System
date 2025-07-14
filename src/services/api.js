import axios from 'axios';
import { toast } from 'react-toastify'; 

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth APIs
export const authApi = {
  login: async (credentials) => {
    try {
      const response = await API.post('/api/auth/login', credentials);
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`; // immediate use
      }

      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  },

  register: async (data) => {
    try {
      const response = await API.post('/api/auth/register', data);
      toast.success('Registration successful! You can now log in.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    toast.info('Logged out');
    window.location.replace('/login');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// NOTE: All endpoints are prefixed with /api for deployed backend compatibility
// Clients APIs
export const clientsApi = {
  getAll: () => API.get('/api/clients').then(res => res.data),
  getById: (id) => API.get(`/api/clients/${id}`).then(res => res.data),
  create: (data) => API.post('/api/clients', data).then(res => res.data),
  update: (id, data) => API.put(`/api/clients/${id}`, data).then(res => res.data),
  remove: (id) => API.delete(`/api/clients/${id}`).then(res => res.data),
};

// Products APIs
export const productsApi = {
  getAll: () => API.get('/api/products').then(res => res.data),
  getById: (id) => API.get(`/api/products/${id}`).then(res => res.data),
  create: (data) => API.post('/api/products', data).then(res => res.data),
  update: (id, data) => API.put(`/api/products/${id}`, data).then(res => res.data),
  remove: (id) => API.delete(`/api/products/${id}`).then(res => res.data),
};

// Contracts APIs
export const contractsApi = {
  getAll: () => API.get('/api/contracts').then(res => res.data),
  getById: (id) => API.get(`/api/contracts/${id}`).then(res => res.data),
  create: (data) => API.post('/api/contracts', data).then(res => res.data),
  update: (id, data) => API.put(`/api/contracts/${id}`, data).then(res => res.data),
  remove: (id) => API.delete(`/api/contracts/${id}`).then(res => res.data),
  exportCSV: () => API.get('/api/contracts/export/csv', { responseType: 'blob' }),
  exportPDF: (id) => API.get(`/api/contracts/${id}/export/pdf`, { responseType: 'blob' }),
};

// Invoices APIs
export const invoicesApi = {
  getAll: () => API.get('/api/invoices').then(res => res.data),
  getById: (id) => API.get(`/api/invoices/${id}`).then(res => res.data),
  create: (data) => API.post('/api/invoices', data).then(res => res.data),
  update: (id, data) => API.put(`/api/invoices/${id}`, data).then(res => res.data),
  remove: (id) => API.delete(`/api/invoices/${id}`).then(res => res.data),
  exportCSV: () => API.get('/api/invoices/export/csv', { responseType: 'blob' }),
  exportPDF: (id) => API.get(`/api/invoices/${id}/export/pdf`, { responseType: 'blob' }),
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () => API.get('/api/dashboard/stats').then(res => res.data),
  getSummary: () => API.get('/api/dashboard/summary').then(res => res.data),
};
