import express from 'express';
import Client from '../models/Client.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clients
 */
router.get('/', authMiddleware, async (req, res) => {
  const clients = await Client.find();
  res.status(200).json(clients);
});

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Client created
 */
router.post('/', authMiddleware, async (req, res) => {
  const client = new Client(req.body);
  await client.save();
  res.status(201).json(client);
});

// Update client
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Error updating client', error: err });
  }
});

// Delete client
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting client', error: err });
  }
});

export default router; 
