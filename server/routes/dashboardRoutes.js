// server/routes/dashboardRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics
 */

/**
 * @swagger
 * /api/dashboard/totals:
 *   get:
 *     summary: Get total billed amount from all invoices
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total amount billed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAmount:
 *                   type: number
 *                   description: Total of all invoices
 */
router.get('/totals', authMiddleware, async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$totalAmount' } } }
    ]);
    res.status(200).json({ totalAmount: result[0]?.totalAmount || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate total billing', error: err });
  }
});

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get invoice status breakdown (paid/unpaid/overdue)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status-wise invoice count
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Invoice status
 *                   count:
 *                     type: number
 *                     description: Number of invoices in that status
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await Invoice.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to summarize invoices', error: err });
  }
});

export default router;
