import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// All routes protected by JWT
router.post('/', authMiddleware, createProduct);
router.get('/', authMiddleware, getProducts);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
