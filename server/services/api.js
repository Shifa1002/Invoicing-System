import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ✅ Attach token to every request
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

// ========== AUTH ==========
const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// ========== CLIENTS ==========
const clientsApi = {
  getAllClients: async () => api.get('/clients').then(res => res.data),
  getClientById: async (id) => api.get(`/clients/${id}`).then(res => res.data),
  createClient: async (data) => api.post('/clients', data).then(res => res.data),
  updateClient: async (id, data) => api.put(`/clients/${id}`, data).then(res => res.data),
  deleteClient: async (id) => api.delete(`/clients/${id}`).then(res => res.data),
};

// ========== CONTRACTS ==========
const contractsApi = {
  getAllContracts: async () => api.get('/contracts').then(res => res.data),
  getContractById: async (id) => api.get(`/contracts/${id}`).then(res => res.data),
  createContract: async (data) => api.post('/contracts', data).then(res => res.data),
  updateContract: async (id, data) => api.put(`/contracts/${id}`, data).then(res => res.data),
  deleteContract: async (id) => api.delete(`/contracts/${id}`).then(res => res.data),
  exportCSV: async () => api.get('/contracts/export/csv', { responseType: 'blob' }),
  exportPDF: async () => api.get('/contracts/export/pdf', { responseType: 'blob' }),
};

// ========== INVOICES ==========
const invoicesApi = {
  getAllInvoices: async () => api.get('/invoices').then(res => res.data),
  getInvoiceById: async (id) => api.get(`/invoices/${id}`).then(res => res.data),
  createInvoice: async (data) => api.post('/invoices', data).then(res => res.data),
  updateInvoice: async (id, data) => api.put(`/invoices/${id}`, data).then(res => res.data),
  deleteInvoice: async (id) => api.delete(`/invoices/${id}`).then(res => res.data),
  exportCSV: async () => api.get('/invoices/export/csv', { responseType: 'blob' }),
  exportPDF: async () => api.get('/invoices/export/pdf', { responseType: 'blob' }),
};

// ========== PRODUCTS ==========
const productsApi = {
  getAllProducts: async () => api.get('/products').then(res => res.data),
  getProductById: async (id) => api.get(`/products/${id}`).then(res => res.data),
  createProduct: async (data) => api.post('/products', data).then(res => res.data),
  updateProduct: async (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  deleteProduct: async (id) => api.delete(`/products/${id}`).then(res => res.data),
};

export {
  api,
  authApi,
  clientsApi,
  contractsApi,
  invoicesApi,
  productsApi
};
