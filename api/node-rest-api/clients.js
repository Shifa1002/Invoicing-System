import express from 'express';
import Client from '../../server/models/Client.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single client
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new client
router.post('/', auth, async (req, res) => {
  try {
    const client = new Client(req.body);
    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a client
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a client
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 