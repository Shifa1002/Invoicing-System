import express from 'express';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product list
 */
router.get('/', authMiddleware, async (req, res) => {
  const products = await Product.find();
  res.status(200).json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', authMiddleware, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

export default router;
