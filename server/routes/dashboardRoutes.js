import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

router.get('/', getDashboardStats);

export default router; 