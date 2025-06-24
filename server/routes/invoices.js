import express from 'express';
import { auth } from '../middleware/auth.js';
import { generateInvoice, getInvoicePdf } from '../controllers/invoiceController.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find({ active: true })
      .populate('client', 'name company')
      .populate('contract')
      .populate('items.product', 'name sku price')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name company email phone address taxId')
      .populate('contract')
      .populate('items.product', 'name sku price description');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    invoice.status = req.body.status;
    const updatedInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(updatedInvoice._id)
      .populate('client', 'name company email phone address taxId')
      .populate('contract')
      .populate('items.product')

    res.json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update invoice
router.patch('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (req.body.dueDate) invoice.dueDate = req.body.dueDate;
    if (req.body.notes) invoice.notes = req.body.notes;
    if (req.body.paymentTerms) invoice.paymentTerms = req.body.paymentTerms;
    if (req.body.tax) invoice.tax = req.body.tax;
    if (req.body.items) {
      invoice.items = req.body.items.map((item) => ({
        product: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
    }

    const updatedInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(updatedInvoice._id)
      .populate('client', 'name company email phone address taxId')
      .populate('contract')
      .populate('items.product', 'name sku price description');

    res.json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete invoice (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.active = false;
    await invoice.save();
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate invoice
router.post('/generate', generateInvoice);

// Get invoice PDF
router.get('/:id/pdf', getInvoicePdf);

export default router; 