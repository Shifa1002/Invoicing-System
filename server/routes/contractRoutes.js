import express from 'express';
import Contract from '../models/Contract.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: Contract operations
 */

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get all contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contracts
 */
router.get('/', authMiddleware, async (req, res) => {
  const contracts = await Contract.find();
  res.status(200).json(contracts);
});

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     summary: Create a new contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Contract created
 */
router.post('/', authMiddleware, async (req, res) => {
  const contract = new Contract(req.body);
  await contract.save();
  res.status(201).json(contract);
});

export default router;
