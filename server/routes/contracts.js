import express from 'express';
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract
} from '../controllers/contractController.js';

const router = express.Router();

router.get('/', getContracts);
router.post('/', createContract);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router; 