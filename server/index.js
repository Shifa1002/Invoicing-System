import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import InvoiceRoutes from './routes/invoiceRoutes.js';
import UserRoutes from './routes/userRoutes.js';
import AuthRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import setupSwagger from './middleware/swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS Configuration
const corsOptions = {
  origin: 'https://invoicing-system-2025.netlify.app', 
  credentials: true,
};

app.use(cors(corsOptions)); //custom CORS config
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Swagger 
setupSwagger(app);

// Routes
app.use('/api/invoices', InvoiceRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/products', productRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Invoicing System Backend is running');
});

// Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
