import express from 'express';
import { getPayments, createPayment } from '../controllers/payments.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getPayments);
router.post('/', authMiddleware, createPayment);

export default router;
