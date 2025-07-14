
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { dirname, join } from 'path';
import auth from './middleware/auth.js';
import productRoutes from './routes/productRoutes.js';
import clientRoutes from './routes/clientsRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['https://invoicing-system-2025.netlify.app', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(join(__dirname, '../client/build')));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version,
    node: process.version,
    server: process.env.SERVER.url,
    port: process.env.PORT,
    database: process.env.MONGODB_URI,
    process: process.env.npm_package_version,
    node_version: process.version,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', auth, clientRoutes);
app.use('/api/products', auth, productRoutes);
app.use('/api/contracts', auth, contractRoutes);
app.use('/api/invoices', auth, invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// React route fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not defined in .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    const PORT = process.env.PORT || 5000;

    // 👇 Use IPv4 binding to prevent EADDRINUSE errors on :: (IPv6)
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
      console.log(`📚 Swagger docs: http://127.0.0.1:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  setTimeout(() => process.exit(1), 1000);
});

export default app;
