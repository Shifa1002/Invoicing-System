import axios from 'axios';
import { toast } from 'react-toastify'; 

// Fallback — throw error if not set
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('❌ Missing REACT_APP_API_BASE_URL. Please set it in your environment.');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


// Request Interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — auto logout on token issues
api.interceptors.response.use(
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

// Auth APIs
export const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // immediate use
      }

      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  },

  register: async (data) => {
    try {
      const response = await api.post('/api/auth/register', data);
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
    delete api.defaults.headers.common['Authorization'];
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
  getAll: () => api.get('/api/clients').then(res => res.data),
  getById: (id) => api.get(`/api/clients/${id}`).then(res => res.data),
  create: (data) => api.post('/api/clients', data).then(res => res.data),
  update: (id, data) => api.put(`/api/clients/${id}`, data).then(res => res.data),
  remove: (id) => api.delete(`/api/clients/${id}`).then(res => res.data),
};

// Products APIs
export const productsApi = {
  getAll: () => api.get('/api/products').then(res => res.data),
  getById: (id) => api.get(`/api/products/${id}`).then(res => res.data),
  create: (data) => api.post('/api/products', data).then(res => res.data),
  update: (id, data) => api.put(`/api/products/${id}`, data).then(res => res.data),
  remove: (id) => api.delete(`/api/products/${id}`).then(res => res.data),
};

// Contracts APIs
export const contractsApi = {
  getAll: () => api.get('/api/contracts').then(res => res.data),
  getById: (id) => api.get(`/api/contracts/${id}`).then(res => res.data),
  create: (data) => api.post('/api/contracts', data).then(res => res.data),
  update: (id, data) => api.put(`/api/contracts/${id}`, data).then(res => res.data),
  remove: (id) => api.delete(`/api/contracts/${id}`).then(res => res.data),
  exportCSV: () => api.get('/api/contracts/export/csv', { responseType: 'blob' }),
  exportPDF: (id) => api.get(`/api/contracts/${id}/export/pdf`, { responseType: 'blob' }),
};

// Invoices APIs
export const invoicesApi = {
  getAll: () => api.get('/api/invoices').then(res => res.data),
  getById: (id) => api.get(`/api/invoices/${id}`).then(res => res.data),
  create: (data) => api.post('/api/invoices', data).then(res => res.data),
  update: (id, data) => api.put(`/api/invoices/${id}`, data).then(res => res.data),
  remove: (id) => api.delete(`/api/invoices/${id}`).then(res => res.data),
  exportCSV: () => api.get('/api/invoices/export/csv', { responseType: 'blob' }),
  exportPDF: (id) => api.get(`/api/invoices/${id}/export/pdf`, { responseType: 'blob' }),
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats').then(res => res.data),
  getSummary: () => api.get('/api/dashboard/summary').then(res => res.data),
};
