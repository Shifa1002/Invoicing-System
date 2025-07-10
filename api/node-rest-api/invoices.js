import express from 'express';
import { auth } from './middleware/auth.js';
import { body, query, validationResult } from 'express-validator';
import Invoice from '../../server/models/Invoice.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - invoiceNumber
 *         - client
 *         - items
 *         - totalAmount
 *         - status
 *       properties:
 *         invoiceNumber:
 *           type: string
 *           description: Unique invoice number
 *         client:
 *           type: object
 *           description: Client information
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [draft, sent, paid, cancelled]
 *         dueDate:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices with pagination
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by invoice status
 *     responses:
 *       200:
 *         description: List of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 totalPages:
 *                   type: number
 *                 currentPage:
 *                   type: number
 *                 totalInvoices:
 *                   type: number
 */
router.get('/',
  auth,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['draft', 'sent', 'paid', 'cancelled']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const query = status ? { status } : {};
      
      const totalInvoices = await Invoice.countDocuments(query);
      const totalPages = Math.ceil(totalInvoices / limit);

      const invoices = await Invoice.find(query)
        .populate('client')
        .populate('items.product')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        invoices,
        totalPages,
        currentPage: page,
        totalInvoices
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('items.product');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
 */
router.post('/',
  auth,
  [
    body('invoiceNumber').notEmpty(),
    body('client').notEmpty(),
    body('items').isArray().notEmpty(),
    body('totalAmount').isNumeric(),
    body('status').isIn(['draft', 'sent', 'paid', 'cancelled']),
    body('dueDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const invoice = new Invoice(req.body);
      const savedInvoice = await invoice.save();
      
      res.status(201).json(savedInvoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 */
router.put('/:id',
  auth,
  [
    body('status').optional().isIn(['draft', 'sent', 'paid', 'cancelled']),
    body('dueDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const invoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('client').populate('items.product');

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 