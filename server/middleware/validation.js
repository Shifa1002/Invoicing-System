import { body, param, query, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Invoice validation rules
export const invoiceValidation = {
  create: [
    body('client').isMongoId().withMessage('Valid client ID is required'),
    body('contract').optional().isMongoId().withMessage('Valid contract ID is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.product').isMongoId().withMessage('Valid product ID is required for each item'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('notes').optional().isString().trim(),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Valid invoice ID is required'),
    body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
      .withMessage('Invalid status'),
    body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
    body('notes').optional().isString().trim(),
    validate
  ],
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
      .withMessage('Invalid status'),
    query('client').optional().isMongoId().withMessage('Valid client ID is required'),
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    validate
  ]
};

// Client validation rules
export const clientValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().trim(),
    body('company').optional().isString().trim(),
    body('address').optional().isString().trim(),
    body('taxId').optional().isString().trim(),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Valid client ID is required'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().trim(),
    body('company').optional().isString().trim(),
    body('address').optional().isString().trim(),
    body('taxId').optional().isString().trim(),
    validate
  ]
};

// Product validation rules
export const productValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().isString().trim(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('unit').optional().isString().trim(),
    body('category').optional().isString().trim(),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Valid product ID is required'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().isString().trim(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('unit').optional().isString().trim(),
    body('category').optional().isString().trim(),
    validate
  ]
};

// Contract validation rules
export const contractValidation = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('client').isMongoId().withMessage('Valid client ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    body('terms').optional().isString().trim(),
    body('paymentTerms').optional().isString().trim(),
    body('products').optional().isArray().withMessage('Products must be an array'),
    body('products.*.product').optional().isMongoId().withMessage('Valid product ID is required'),
    body('products.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('products.*.price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    validate
  ],
  update: [
    param('id').isMongoId().withMessage('Valid contract ID is required'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['draft', 'active', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    body('terms').optional().isString().trim(),
    body('paymentTerms').optional().isString().trim(),
    validate
  ]
}; 