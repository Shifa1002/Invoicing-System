import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user and return JWT
router.post('/login', login);

// @route   POST /api/auth/register
// @desc    Register new user
router.post('/register', register);

export default router; 