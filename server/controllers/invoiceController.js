import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Contract from '../models/Contract.js';
import Client from '../models/Client.js';
import { ApiError } from '../middleware/errorhandler.js';
import { exportToCSV } from '../services/csvService.js';
import PDFService from '../services/pdfService.js';
import EmailService from '../services/emailService.js';
import { mailTransporter } from '../index.js';
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

// Get all invoices with search and pagination
export const getInvoices = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = 'createdAt:desc' } = req.query;
    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'desc' ? -1 : 1 };
    }

    // Execute query with pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('client', 'name email')
        .populate('contract', 'title')
        .populate('products.product', 'name price')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Invoice.countDocuments(query)
    ]);

    res.json({
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('contract', 'title startDate endDate')
      .populate('products.product', 'name price unit');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create invoice
export const createInvoice = async (req, res, next) => {
  try {
    const {
      contractId,
      clientId,
      products,
      totalAmount,
      subtotal,
      tax,
      dueDate,
      notes,
      terms,
      paymentMode,
      paymentMethod,
      paymentReference,
      isPaid,
      paymentDate
    } = req.body;

    // Validate required fields
    if (!clientId || !products || !totalAmount || !dueDate) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal || products.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100));
    }, 0);

    const calculatedTax = tax || (calculatedSubtotal * 0.1); // 10% tax
    const calculatedTotal = totalAmount || (calculatedSubtotal + calculatedTax);

    const invoice = new Invoice({
      contract: contractId,
      client: clientId,
      products: products.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        notes: item.notes || '',
      })),
      totalAmount: calculatedTotal,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      dueDate: new Date(dueDate),
      notes,
      terms,
      paymentMode,
      paymentMethod,
      paymentReference,
      isPaid: isPaid || false,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      createdBy: req.user._id,
    });

    const savedInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(savedInvoice._id)
      .populate('client', 'name email')
      .populate('contract', 'title')
      .populate('products.product', 'name price');

    // Send email if invoice is marked as paid
    if (isPaid && populatedInvoice.client) {
      try {
        await EmailService.sendInvoiceEmail(populatedInvoice, populatedInvoice.client);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
      }
    }

    res.status(201).json({ invoice: populatedInvoice });
  } catch (error) {
    next(new ApiError(400, error.message || 'Failed to create invoice'));
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const {
      products,
      totalAmount,
      subtotal,
      tax,
      dueDate,
      notes,
      terms,
      paymentMode,
      paymentMethod,
      paymentReference,
      isPaid,
      paymentDate,
      status
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update fields
    if (products) invoice.products = products;
    if (totalAmount !== undefined) invoice.totalAmount = totalAmount;
    if (subtotal !== undefined) invoice.subtotal = subtotal;
    if (tax !== undefined) invoice.tax = tax;
    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (notes !== undefined) invoice.notes = notes;
    if (terms !== undefined) invoice.terms = terms;
    if (paymentMode) invoice.paymentMode = paymentMode;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentReference) invoice.paymentReference = paymentReference;
    if (isPaid !== undefined) invoice.isPaid = isPaid;
    if (paymentDate) invoice.paymentDate = new Date(paymentDate);
    if (status) invoice.status = status;

    const updatedInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(updatedInvoice._id)
      .populate('client', 'name email')
      .populate('contract', 'title')
      .populate('products.product', 'name price');

    res.status(200).json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete invoice (soft delete)
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export invoices as CSV
export const exportInvoicesCSV = async (req, res) => {
  try {
    const invoices = await Invoice.find({ isActive: true })
      .populate('client', 'name email')
      .populate('contract', 'title');
    
    const fields = [
      'invoiceNumber', 
      'client.name', 
      'contract.title', 
      'totalAmount', 
      'status', 
      'issueDate', 
      'dueDate',
      'paymentMode',
      'isPaid'
    ];
    
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
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('contract')
      .populate('products.product');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
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

// Send invoice via email
export const sendInvoiceEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { to, subject, text } = req.body;
    // Generate or fetch PDF (stubbed as 'invoice.pdf')
    const pdfPath = `./invoices/invoice-${id}.pdf`;
    // In production, generate PDF dynamically
    if (!fs.existsSync(pdfPath)) {
      // Stub: create a dummy PDF if not exists
      fs.writeFileSync(pdfPath, 'PDF content');
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: subject || 'Your Invoice',
      text: text || 'Please find your invoice attached.',
      attachments: [
        {
          filename: `invoice-${id}.pdf`,
          path: pdfPath,
        },
      ],
    };
    await mailTransporter.sendMail(mailOptions);
    res.json({ message: 'Invoice email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send invoice email', error: error.message });
  }
};

// Utility to calculate total invoice amount
const calculateTotalAmount = (products) => {
  return products.reduce((sum, item) => {
    const price = item?.product?.price || item?.unitPrice || 0;
    const quantity = item.quantity || 0;
    const discount = item.discount || 0;
    const itemTotal = price * quantity * (1 - discount / 100);
    return sum + itemTotal;
  }, 0);
};
