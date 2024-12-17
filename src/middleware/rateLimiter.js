const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const rateLimiters = {
  login: createRateLimiter(
    15 * 60 * 1000,
    10,
    "Too many login attempts. Please try again after 15 minutes."
  ),

  register: createRateLimiter(
    30 * 60 * 1000,
    10,
    "Too many registration attempts. Please try again after 1 hour."
  ),
};

module.exports = rateLimiters;
