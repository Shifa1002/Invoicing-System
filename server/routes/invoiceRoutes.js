import express from 'express';
import auth from '../middleware/auth.js';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  exportInvoicesCSV,
  exportInvoicePDF
} from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/', auth, getInvoices);
router.get('/:id', auth, getInvoiceById);
router.post('/', auth, createInvoice);
router.put('/:id', auth, updateInvoice);
router.delete('/:id', auth, deleteInvoice);
router.get('/export/csv', auth, exportInvoicesCSV);
router.get('/:id/export/pdf', auth, exportInvoicePDF);

export default router;
