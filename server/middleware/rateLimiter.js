import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Create Redis client
const redisClient = new Redis(process.env.REDIS_URI);

// General API limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Auth routes limiter (more strict)
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Password reset limiter
console.log('redis uri', process.env.REDIS_URI)
export const passwordResetLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:pwreset:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again after sometime'  },
  standardHeaders: true,
  legacyHeaders: false
  
});

// Invoice creation limiter
export const invoiceCreationLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:invoice:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many invoice creation attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Export cleanup function
export const cleanup = async () => {
  await redisClient.quit();
}; 