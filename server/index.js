import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { initializeSocket } from './config/socket.js';

// Load environment variables early
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

const allowedOrigins = [
  'https://invoicing-system-2025.netlify.app',
  'https://invoicing-system.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Handle preflight requests
app.options('*', cors());


// ✅ Export nodemailer transporter for use in services
export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Middleware
import { requestLogger, errorLogger } from './middleware/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter, authLimiter, cleanup as rateLimitCleanup } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import productRoutes from './routes/productRoutes.js';
import clientRoutes from './routes/clientsRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

const startServer = async () => {
  await connectDB();
  initializeSocket(server);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestLogger);

  // Apply rate limiting
  app.use('/api/', apiLimiter);
  app.use('/api/auth', authLimiter);

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/contracts', contractRoutes);
  app.use('/api/invoices', invoiceRoutes);

  // Health check (moved to /api/health for consistency)
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get('/api/test', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'API is live and authenticated routes are mounted.',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling
  app.use(notFound);
  app.use(errorLogger);
  app.use(errorHandler);

  // Start server
  const PORT = 5000;

  server.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
    console.log(`📈 Health check available at: http://localhost:${PORT}/health`);
  });

  // Cleanup and exit handling
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Cleaning up...');
    rateLimitCleanup();
    server.close(() => {
      console.log('✅ Server closed.');
    });
  });
};

startServer();
