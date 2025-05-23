import express from 'express';
import { getClients, createClient } from '../controllers/clients.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getClients);
router.post('/', authMiddleware, createClient);

export default router;
