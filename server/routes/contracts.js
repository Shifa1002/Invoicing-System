import express from 'express';
import auth from '../middleware/auth.js';
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract
} from '../controllers/contractController.js';

const router = express.Router();

router.get('/', auth, getContracts);
router.post('/', auth, createContract);
router.put('/:id', auth, updateContract);
router.delete('/:id', auth, deleteContract);

export default router; 