import Invoice from '../models/Invoice.js'
import Client from '../models/Client.js';
import Product from '../models/Product.js';
import Contract from '../models/Contract.js';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate PDF for an invoice
const generatePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const pdfPath = path.join(__dirname, `../temp/invoice-${invoice._id}.pdf`);
      const writeStream = fs.createWriteStream(pdfPath);

      // Pipe PDF to file
      doc.pipe(writeStream);

      // Add company logo
      doc.image(path.join(__dirname, '../assets/logo.png'), 50, 45, { width: 50 })
         .moveDown();

      // Add company info
      doc.fontSize(20)
         .text('INVOICE', { align: 'right' })
         .moveDown();

      // Add invoice details
      doc.fontSize(12)
         .text(`Invoice Number: ${invoice.invoiceNumber}`)
         .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`)
         .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`)
         .moveDown();

      // Add client info
      doc.text('Bill To:')
         .text(invoice.client.name)
         .text(invoice.client.company || '')
         .text(invoice.client.address || '')
         .text(invoice.client.email)
         .moveDown();

      // Add items table
      const tableTop = 250;
      doc.fontSize(12)
         .text('Item', 50, tableTop)
         .text('Quantity', 250, tableTop)
         .text('Price', 350, tableTop)
         .text('Total', 450, tableTop)
         .moveDown();

      let y = tableTop + 20;
      invoice.items.forEach(item => {
        doc.text(item.product.name, 50, y)
           .text(item.quantity.toString(), 250, y)
           .text(`$${item.price.toFixed(2)}`, 350, y)
           .text(`$${(item.quantity * item.price).toFixed(2)}`, 450, y);
        y += 20;
      });

      // Add totals
      doc.moveDown()
         .text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, { align: 'right' })
         .text(`Tax (10%): $${invoice.tax.toFixed(2)}`, { align: 'right' })
         .text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right' })
         .moveDown();

      // Add notes
      if (invoice.notes) {
        doc.text('Notes:', 50, y + 20)
           .text(invoice.notes, 50, y + 40);
      }

      // Add payment terms
      doc.text(`Payment Terms: ${invoice.paymentTerms || 'Net 30'}`, 50, y + 80);

      // Finalize PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve(pdfPath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      createdBy: req.user._id
    });

    // Calculate totals
    const subtotal = invoice.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    invoice.subtotal = subtotal;
    invoice.tax = tax;
    invoice.total = subtotal + tax;

    const savedInvoice = await invoice.save();
    await savedInvoice.populate(['client', 'items.product']);
    
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all invoices with pagination
export const getInvoices = async (req, res) => {
  try {
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
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
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
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
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
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('client').populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfPath = await generatePDF(invoice);
    
    res.download(pdfPath, `invoice-${invoice.invoiceNumber}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading PDF:', err);
      }
      // Clean up the temporary file
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting temporary PDF:', unlinkErr);
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/invoices/generate:
 *   post:
 *     summary: Generate an invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - products
 *               - contractId
 *             properties:
 *               clientId:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               contractId:
 *                 type: string
 */
export const generateInvoice = async (req, res) => {
  try {
    const { clientId, products, contractId } = req.body;

    // Fetch client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Fetch contract if provided
    let contract = null;
    if (contractId) {
      contract = await Contract.findById(contractId);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
    }

    // Fetch products and calculate totals
    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        return {
          product,
          quantity: item.quantity,
          unitPrice: product.price,
          amount: product.price * item.quantity
        };
      })
    );

    // Calculate invoice totals
    const subtotal = productDetails.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax rate
    const total = subtotal + tax;

    // Create invoice
    const invoice = new Invoice({
      client: clientId,
      contract: contractId,
      items: productDetails.map(item => ({
        product: item.product._id,
        description: item.product.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount
      })),
      subtotal,
      tax,
      total,
      dueDate: moment().add(30, 'days').toDate(),
      status: 'draft',
      paymentTerms: contract ? contract.paymentTerms : 'Net 30'
    });

    await invoice.save();

    // Populate the saved invoice with all necessary data
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('client')
      .populate('contract')
      .populate('items.product');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/invoices/{id}/pdf:
 *   get:
 *     summary: Get invoice PDF
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
export const getInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('contract')
      .populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `Invoice-${invoice.invoiceNumber}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add company info
    doc.fontSize(20).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text('Your Company Name', { align: 'right' });
    doc.fontSize(10).text('123 Business Street', { align: 'right' });
    doc.fontSize(10).text('City, State, ZIP', { align: 'right' });
    doc.moveDown();

    // Add invoice details
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.fontSize(12).text(`Date: ${moment(invoice.issueDate).format('MMMM D, YYYY')}`);
    doc.fontSize(12).text(`Due Date: ${moment(invoice.dueDate).format('MMMM D, YYYY')}`);
    doc.moveDown();

    // Add client info
    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(invoice.client.name);
    doc.fontSize(10).text(invoice.client.address);
    doc.fontSize(10).text(`Email: ${invoice.client.email}`);
    doc.fontSize(10).text(`Phone: ${invoice.client.phone}`);
    doc.moveDown();

    // Add items table
    const tableTop = 300;
    const itemTop = tableTop + 30;
    let currentTop = itemTop;

    // Table headers
    doc.fontSize(10)
      .text('Item', 50, tableTop)
      .text('Description', 200, tableTop)
      .text('Quantity', 350, tableTop)
      .text('Unit Price', 400, tableTop)
      .text('Amount', 500, tableTop);

    // Table rows
    invoice.items.forEach((item, index) => {
      currentTop = itemTop + (index * 30);
      doc.fontSize(10)
        .text(item.product.name, 50, currentTop)
        .text(item.description || '', 200, currentTop)
        .text(item.quantity.toString(), 350, currentTop)
        .text(`$${item.unitPrice.toFixed(2)}`, 400, currentTop)
        .text(`$${item.amount.toFixed(2)}`, 500, currentTop);
    });

    // Add totals
    const totalsTop = currentTop + 50;
    doc.fontSize(10)
      .text('Subtotal:', 400, totalsTop)
      .text(`$${invoice.subtotal.toFixed(2)}`, 500, totalsTop)
      .text('Tax:', 400, totalsTop + 20)
      .text(`$${invoice.tax.toFixed(2)}`, 500, totalsTop + 20)
      .text('Total:', 400, totalsTop + 40)
      .text(`$${invoice.total.toFixed(2)}`, 500, totalsTop + 40);

    // Add payment terms and notes
    if (invoice.paymentTerms || invoice.notes) {
      doc.moveDown(2)
        .fontSize(10)
        .text('Payment Terms:', 50, totalsTop + 80)
        .text(invoice.paymentTerms || 'N/A', 50, totalsTop + 100)
        .text('Notes:', 50, totalsTop + 140)
        .text(invoice.notes || 'N/A', 50, totalsTop + 160);
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


