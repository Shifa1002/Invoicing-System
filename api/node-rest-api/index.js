import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSwagger } from './swagger.js';
import productRoutes from './products.js';
import clientRoutes from './clients.js';
import invoiceRoutes from './invoices.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.API_PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Server is running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app; 