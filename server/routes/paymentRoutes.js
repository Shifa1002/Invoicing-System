import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing (mock)
 */

/**
 * @swagger
 * /api/payments/checkout:
 *   post:
 *     summary: Initiate payment (mock)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment session created
 */
router.post('/checkout', authMiddleware, async (req, res) => {
  // Placeholder for Stripe/Razorpay integration
  res.status(200).json({ message: 'Payment initiated (mock)' });
});

export default router;
