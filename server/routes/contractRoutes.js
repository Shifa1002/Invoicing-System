import express from 'express';
import auth from '../middleware/auth.js';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  exportContractsCSV,
  exportContractPDF
} from '../controllers/contractController.js';

const router = express.Router();

router.get('/', auth, getContracts);
router.get('/:id', auth, getContractById);
router.post('/', auth, createContract);
router.put('/:id', auth, updateContract);
router.delete('/:id', auth, deleteContract);
router.get('/export/csv', auth, exportContractsCSV);
router.get('/:id/export/pdf', auth, exportContractPDF);

export default router; 