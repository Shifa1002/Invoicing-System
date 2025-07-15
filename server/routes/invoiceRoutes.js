import express from 'express';
import Invoice from '../models/Invoice.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InvoiceItem:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *     Invoice:
 *       type: object
 *       required:
 *         - client
 *         - items
 *         - totalAmount
 *         - dueDate
 *       properties:
 *         client:
 *           type: string
 *           description: MongoDB ObjectId of the client
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItem'
 *         totalAmount:
 *           type: number
 *         dueDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Draft, Sent, Paid]
 */

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client user');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
