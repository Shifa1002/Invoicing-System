import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Contract from '../models/Contract.js';
import { ApiError } from '../middleware/errorhandler.js';
import { exportToCSV } from '../services/csvService.js';
import PDFService from '../services/pdfService.js';
import fs from 'fs';

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contractId
 *             properties:
 *               contractId:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoice:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       format: objectId
 *                     contract:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           format: objectId
 *                         client:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               format: objectId
 *                             name:
 *                               type: string
 *                         products:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               product:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                     format: objectId
 *                                   name:
 *                                     type: string
 *                               quantity:
 *                                 type: number
 *                     client:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           format: objectId
 *                         name:
 *                           type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 format: objectId
 *                               name:
 *                                 type: string
 *                           quantity:
 *                             type: number
 *                     totalAmount:
 *                       type: number
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Contract not found
 */

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client', 'name email').populate('contract', 'title');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client', 'name email').populate('contract', 'title');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create invoice
export const createInvoice = async (req, res, next) => {
  try {
    const contractId = req.params.contractId || req.body.contractId;
    if (!contractId || !mongoose.Types.ObjectId.isValid(contractId)) {
      throw new ApiError(400, 'Valid contract ID is required');
    }
    const contract = await Contract.findById(contractId).populate('client', 'name email').populate('products.product', 'name price');
    if (!contract) {
      throw new ApiError(404, 'Contract not found');
    }
    const totalAmount = calculateTotalAmount(contract.products);
    const invoice = new Invoice({
      contract: contract._id,
      client: contract.client._id,
      products: contract.products,
      totalAmount,
    });
    const savedInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(savedInvoice._id).populate('client', 'name email').populate('products.product', 'name price');
    res.status(201).json({ invoice: populatedInvoice });
  } catch (error) {
    next(new ApiError(400, error.message || 'Failed to create invoice'));
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete invoice (soft delete)
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export invoices as CSV
export const exportInvoicesCSV = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client', 'name email').populate('contract', 'title');
    const fields = ['_id', 'invoiceNumber', 'client.name', 'contract.title', 'totalAmount', 'status', 'issueDate', 'dueDate'];
    const filePath = exportToCSV(invoices, fields, 'invoices');
    res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export invoice as PDF
export const exportInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client').populate('contract');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const pdfPath = await PDFService.generateInvoicePDF(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber || invoice._id}.pdf`);
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
    fileStream.on('end', () => {
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utility to calculate total invoice amount
const calculateTotalAmount = (products) => {
  return products.reduce((sum, item) => {
    const price = item?.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
};
