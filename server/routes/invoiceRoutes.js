import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  exportInvoicesCSV,
  exportInvoicePDF,
  sendInvoiceEmail
} from '../controllers/invoiceController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// CRUD operations
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

// Export functionality
router.get('/export/csv', exportInvoicesCSV);
router.get('/:id/export/pdf', exportInvoicePDF);

// Email functionality
router.post('/:id/send-email', sendInvoiceEmail);

export default router;
