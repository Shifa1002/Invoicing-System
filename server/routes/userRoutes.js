import express from 'express';

const router = express.Router();

// Example: GET /api/users/me
router.get('/me', (req, res) => {
  res.status(200).json({ message: 'User route placeholder' });
});

export default router; 