const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return (
        req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress
      );
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message,
        retryAfter: Math.ceil(windowMs / 1000 / 60),
      });
    },
  });
};

const rateLimiters = {
  login: createRateLimiter(
    15 * 60 * 1000,
    10,
    "Too many login attempts from this IP. Please try again after 15 minutes."
  ),

  register: createRateLimiter(
    30 * 60 * 1000,
    10,
    "Too many registration attempts from this IP. Please try again after 30 minutes."
  ),

  global: createRateLimiter(
    60 * 60 * 1000,
    1000,
    "Too many requests from this IP. Please try again later."
  ),
};

module.exports = rateLimiters;
