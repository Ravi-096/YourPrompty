import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 10,
  message: {
    success: false,
    error: 'Too many messages! Please slow down and try again in a minute. 😊'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,

  keyGenerator: (req) => {
    return req.user?.id || ipKeyGenerator(req);
  }
});