import rateLimit from 'express-rate-limit';

// ✅ General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Auth limiter (login/register)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Invoice creation limiter
export const invoiceCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    success: false,
    error: 'Too many invoice creation attempts, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Cleanup stub for compatibility
export const cleanup = () => {
  // No Redis connection to close
};
