import morgan from 'morgan';
import winston from 'winston';

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transport if needed
    // new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

// Request logger middleware (using morgan)
export const requestLogger = morgan('dev');

// Error logger middleware
export const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  next(err);
}; 