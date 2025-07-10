import Contract from '../models/Contract.js';
import Client from '../models/Client.js';
import { exportToCSV } from '../services/csvService.js';
import PDFService from '../services/pdfService.js';
import EmailService from '../services/emailService.js';
import mongoose from 'mongoose';
import { mailTransporter } from '../index.js';
import fs from 'fs';

// Get all contracts with search and pagination
export const getContracts = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = 'createdAt:desc' } = req.query;
    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
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
    const [contracts, total] = await Promise.all([
      Contract.find(query)
        .populate('client', 'name email')
        .populate('products.product', 'name price')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Contract.countDocuments(query)
    ]);

    res.json({
      contracts,
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

// Get contract by ID
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client', 'name email phone address')
      .populate('products.product', 'name price unit');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create contract
export const createContract = async (req, res) => {
  try {
    const {
      title,
      description,
      clientId,
      products,
      startDate,
      endDate,
      totalAmount,
      subtotal,
      tax,
      paymentTerms,
      currency,
      billingCycle,
      autoRenew,
      renewalTerm,
      notes,
      status
    } = req.body;

    // Validate required fields
    if (!title || !clientId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal || products.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100));
    }, 0);

    const calculatedTax = tax || (calculatedSubtotal * 0.1); // 10% tax
    const calculatedTotal = totalAmount || (calculatedSubtotal + calculatedTax);

    const contract = new Contract({
      title,
      description,
      client: clientId,
      products: products.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        notes: item.notes || '',
      })),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalAmount: calculatedTotal,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      paymentTerms: paymentTerms || 'net30',
      currency: currency || 'USD',
      billingCycle: billingCycle || 'one-time',
      autoRenew: autoRenew || false,
      renewalTerm: renewalTerm || 12,
      notes,
      status: status || 'draft',
      createdBy: req.user._id,
    });

    const savedContract = await contract.save();
    const populatedContract = await Contract.findById(savedContract._id)
      .populate('client', 'name email')
      .populate('products.product', 'name price');

    res.status(201).json(populatedContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update contract
export const updateContract = async (req, res) => {
  try {
    const {
      title,
      description,
      products,
      startDate,
      endDate,
      totalAmount,
      subtotal,
      tax,
      paymentTerms,
      currency,
      billingCycle,
      autoRenew,
      renewalTerm,
      notes,
      status
    } = req.body;

    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Update fields
    if (title) contract.title = title;
    if (description !== undefined) contract.description = description;
    if (products) contract.products = products;
    if (startDate) contract.startDate = new Date(startDate);
    if (endDate) contract.endDate = new Date(endDate);
    if (totalAmount !== undefined) contract.totalAmount = totalAmount;
    if (subtotal !== undefined) contract.subtotal = subtotal;
    if (tax !== undefined) contract.tax = tax;
    if (paymentTerms) contract.paymentTerms = paymentTerms;
    if (currency) contract.currency = currency;
    if (billingCycle) contract.billingCycle = billingCycle;
    if (autoRenew !== undefined) contract.autoRenew = autoRenew;
    if (renewalTerm) contract.renewalTerm = renewalTerm;
    if (notes !== undefined) contract.notes = notes;
    if (status) contract.status = status;

    const updatedContract = await contract.save();
    const populatedContract = await Contract.findById(updatedContract._id)
      .populate('client', 'name email')
      .populate('products.product', 'name price');

    res.status(200).json(populatedContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete contract (soft delete)
export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.status(200).json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export contracts as CSV
export const exportContractsCSV = async (req, res) => {
  try {
    const contracts = await Contract.find({ isActive: true })
      .populate('client', 'name email');
    
    const fields = [
      'contractNumber',
      'title', 
      'client.name', 
      'startDate', 
      'endDate', 
      'totalAmount',
      'status',
      'paymentTerms',
      'billingCycle'
    ];
    
    const filePath = exportToCSV(contracts, fields, 'contracts');
    res.download(filePath, () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export contract as PDF
export const exportContractPDF = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client')
      .populate('products.product');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    const pdfPath = await PDFService.generateContractPDF(contract);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${contract.contractNumber || contract._id}.pdf`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
    fileStream.on('end', () => {
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send contract via email
export const sendContractEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { to, subject, text } = req.body;
    // Generate or fetch PDF (stubbed as 'contract.pdf')
    const pdfPath = `./contracts/contract-${id}.pdf`;
    // In production, generate PDF dynamically
    if (!fs.existsSync(pdfPath)) {
      // Stub: create a dummy PDF if not exists
      fs.writeFileSync(pdfPath, 'PDF content');
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: subject || 'Your Contract',
      text: text || 'Please find your contract attached.',
      attachments: [
        {
          filename: `contract-${id}.pdf`,
          path: pdfPath,
        },
      ],
    };
    await mailTransporter.sendMail(mailOptions);
    res.json({ message: 'Contract email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send contract email', error: error.message });
  }
};