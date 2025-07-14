import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getDashboardStats);

export default router; 