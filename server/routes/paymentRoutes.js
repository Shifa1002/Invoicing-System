import express from 'express';
import { getPayments, createPayment } from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getPayments);
router.post('/', authMiddleware, createPayment);

export default router;
