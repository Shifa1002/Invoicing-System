import express from 'express';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import Invoice from '../models/Invoice.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfService from '../services/pdfService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all invoices with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    const query = search
      ? {
          $or: [
            { invoiceNumber: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
          ],
          isActive: true,
        }
      : { isActive: true };

    const totalInvoices = await Invoice.countDocuments(query);
    const totalPages = Math.ceil(totalInvoices / limit);

    const invoices = await Invoice.find(query)
      .populate('client', 'name email')
      .populate('contract', 'title')
      .populate('items.product', 'name price unit')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      invoices,
      totalPages,
      currentPage: page,
      totalInvoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('contract', 'title')
      .populate('items.product', 'name price unit');
      
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new invoice
router.post('/',
  [
    body('contract').isMongoId().withMessage('Valid contract ID is required'),
    body('client').isMongoId().withMessage('Valid client ID is required'),
    body('invoiceNumber').trim().notEmpty().withMessage('Invoice number is required'),
    body('issueDate').isISO8601().withMessage('Valid issue date is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
    body('items.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const invoice = new Invoice({
        ...req.body,
        createdBy: req.user.id,
      });

      const savedInvoice = await invoice.save();
      const populatedInvoice = await Invoice.findById(savedInvoice._id)
        .populate('client', 'name email')
        .populate('contract', 'title')
        .populate('items.product', 'name price unit');

      res.status(201).json(populatedInvoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update invoice
router.put('/:id',
  [
    body('contract').optional().isMongoId().withMessage('Valid contract ID is required'),
    body('client').optional().isMongoId().withMessage('Valid client ID is required'),
    body('invoiceNumber').optional().trim().notEmpty().withMessage('Invoice number cannot be empty'),
    body('issueDate').optional().isISO8601().withMessage('Valid issue date is required'),
    body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('items.*.product').optional().isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('items.*.unitPrice').optional().isNumeric().withMessage('Unit price must be a number'),
    body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
      .withMessage('Invalid status'),
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
      ).populate('client', 'name email')
       .populate('contract', 'title')
       .populate('items.product', 'name price unit');

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete invoice (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'contract',
        populate: {
          path: 'client',
          select: 'name email phone address company',
        },
      })
      .populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfPath = await pdfService.generateInvoicePDF(invoice);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );

    // Stream the PDF file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    // Clean up the temporary file after sending
    fileStream.on('end', () => {
      fs.unlink(pdfPath, (err) => {
        if (err) console.error('Error deleting temporary PDF:', err);
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

// Send invoice via email
router.post('/:id/send-email', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'contract',
        populate: {
          path: 'client',
          select: 'name email',
        },
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (!invoice.contract.client.email) {
      return res.status(400).json({
        message: 'Client email not found',
      });
    }

    // Generate PDF
    const pdfPath = await pdfService.generateInvoicePDF(invoice);

    // TODO: Implement email service
    // For now, just return success
    res.json({ message: 'Invoice sent successfully' });

    // Clean up the temporary file
    fs.unlink(pdfPath, (err) => {
      if (err) console.error('Error deleting temporary PDF:', err);
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ message: 'Error sending invoice' });
  }
});

export default router; 