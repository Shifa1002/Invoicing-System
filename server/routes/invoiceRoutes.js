import express from 'express';
import Invoice from '../models/Invoice.js';
import authMiddleware from '../middleware/authMiddleware.js';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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

// Update invoice
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Error updating invoice', error: err });
  }
});

// Delete invoice
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting invoice', error: err });
  }
});

// Download invoice as PDF
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${invoice._id}.pdf`,
        'Content-Length': pdfData.length
      });
      res.end(pdfData);
    });
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Client: ${invoice.client?.name || ''}`);
    doc.text(`Total Amount: $${invoice.totalAmount}`);
    doc.text(`Due Date: ${invoice.dueDate}`);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'Error generating PDF', error: err });
  }
});

export default router;
