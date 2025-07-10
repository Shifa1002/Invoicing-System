import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please log in again.' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token. Please log in again.' });
      }
      return res.status(401).json({ message: 'Token verification failed.' });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
