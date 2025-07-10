// DEPRECATED: Use server/index.js as the only backend entry point.
// This file is archived to prevent confusion.
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

// Load environment variables first
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';

// Load Swagger documentation
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the React app
app.use(express.static(join(__dirname, '../client/build')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', auth, clientRoutes);
app.use('/api/products', auth, productRoutes);
app.use('/api/contracts', auth, contractRoutes);
app.use('/api/invoices', auth, invoiceRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/dashboard', dashboardRoutes);

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/build', 'index.html'));
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
   const PORT = 5050;
;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start the server
connectWithRetry();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});


process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);

});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Give the server time to log the error before crashing
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});


export default app; 