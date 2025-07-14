import express from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  exportContractsCSV,
  exportContractPDF,
  sendContractEmail
} from '../controllers/contractController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// CRUD operations
router.get('/', getContracts);
router.get('/:id', getContractById);
router.post('/', createContract);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

// Export functionality
router.get('/export/csv', exportContractsCSV);
router.get('/:id/export/pdf', exportContractPDF);

// Email functionality
router.post('/:id/send-email', sendContractEmail);

export default router; 