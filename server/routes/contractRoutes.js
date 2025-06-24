import express from 'express';
import { body, validationResult } from 'express-validator';
import Contract from '../models/Contract.js';

const router = express.Router();

// Get all contracts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
          isActive: true,
        }
      : { isActive: true };

    const totalContracts = await Contract.countDocuments(query);
    const totalPages = Math.ceil(totalContracts / limit);

    const contracts = await Contract.find(query)
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      contracts,
      totalPages,
      currentPage: page,
      totalContracts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get contract by ID
router.get('/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client', 'name email')
      .populate('items.product', 'name price unit');
      
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new contract
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('client').isMongoId().withMessage('Valid client ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
    body('items.*.discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
    body('terms').optional().isObject().withMessage('Terms must be an object'),
    body('terms.paymentTerms').optional().isIn(['immediate', 'net15', 'net30', 'net60']).withMessage('Invalid payment terms'),
    body('terms.currency').optional().isString().withMessage('Currency must be a string'),
    body('terms.billingCycle').optional().isIn(['one-time', 'monthly', 'quarterly', 'annually']).withMessage('Invalid billing cycle'),
    body('terms.autoRenew').optional().isBoolean().withMessage('Auto renew must be a boolean'),
    body('terms.renewalTerm').optional().isInt({ min: 1 }).withMessage('Renewal term must be at least 1'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      console.log('Creating contract with data:', req.body);
      console.log('User ID:', req.user.id);
      console.log('Terms type:', typeof req.body.terms);
      console.log('Terms value:', req.body.terms);

      // Calculate total amount from items
      let totalAmount = 0;
      if (req.body.items && req.body.items.length > 0) {
        totalAmount = req.body.items.reduce((total, item) => {
          const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
          const discount = itemTotal * (parseFloat(item.discount || 0) / 100);
          return total + (itemTotal - discount);
        }, 0);
      }

      // Ensure terms is an object with proper structure
      const terms = {
        paymentTerms: req.body.terms?.paymentTerms || 'net30',
        currency: req.body.terms?.currency || 'USD',
        billingCycle: req.body.terms?.billingCycle || 'one-time',
        autoRenew: !!req.body.terms?.autoRenew,
        renewalTerm: parseInt(req.body.terms?.renewalTerm || 12) || 12
      };

      const contract = new Contract({
        ...req.body,
        totalAmount,
        terms,
        createdBy: req.user.id,
      });

      console.log('Contract object before save:', contract);
      const savedContract = await contract.save();
      const populatedContract = await Contract.findById(savedContract._id)
        .populate('client', 'name email')
        .populate('items.product', 'name price unit');

      res.status(201).json(populatedContract);
    } catch (error) {
      console.error('Contract creation error:', error);
      
      // Provide more detailed error messages
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: validationErrors 
        });
      }
      
      res.status(400).json({ message: error.message });
    }
  }
);

// Update contract
router.put('/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('client').optional().isMongoId().withMessage('Valid client ID is required'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('items.*.product').optional().isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('items.*.unitPrice').optional().isNumeric().withMessage('Unit price must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const contract = await Contract.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('client', 'name email')
       .populate('items.product', 'name price unit');

      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      res.json(contract);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete contract (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 