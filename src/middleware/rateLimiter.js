const Redis = require("redis");

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully.");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

const getIP = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  if (req.ip) {
    return req.ip.replace(/^::ffff:/, "");
  }

  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress.replace(/^::ffff:/, "");
  }

  console.log("No IP address detected, using fallback.");
  return "127.0.0.1";
};

const createIPRateLimiter = (windowMs, max, message) => {
  return async (req, res, next) => {
    try {
      if (!redisClient.isOpen) {
        console.log("Redis not connected, skipping rate limit.");
        return next();
      }

      const ip = getIP(req);
      const key = `rate_limit:${req.path}:${ip}`;
      console.log(`Request from IP: ${ip}`);

      const count = await redisClient.incr(key);
      console.log(`Request count: ${count}`);

      if (count === 1) {
        await redisClient.pExpire(key, windowMs);
      }

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - count));

      if (count > max) {
        console.log(`Rate limit exceeded for ${ip}`);
        return res.status(429).json({
          success: false,
          message: message,
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next();
    }
  };
};

const createApiKeyRateLimiter = (windowMs, max, message) => {
  return async (req, res, next) => {
    try {
      if (!redisClient.isOpen) {
        console.log("Redis not connected, skipping rate limit.");
        return next();
      }

      const apiKey = req.headers["x-api-key"];
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: "API key is required",
        });
      }

      const key = `rate_limit:chat:${apiKey}`;
      console.log(`Chat request from API Key: ${apiKey.substring(0, 8)}...`);

      const count = await redisClient.incr(key);
      console.log(`Request count: ${count}`);

      if (count === 1) {
        await redisClient.pExpire(key, windowMs);
      }

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - count));

      if (count > max) {
        console.log(
          `Rate limit exceeded for API Key: ${apiKey.substring(0, 8)}...`
        );
        return res.status(429).json({
          success: false,
          message: message,
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next();
    }
  };
};

const rateLimiters = {
  login: createIPRateLimiter(
    2 * 60 * 1000,
    10,
    "Too many login attempts from this IP. Please try again later."
  ),

  register: createIPRateLimiter(
    2 * 60 * 1000,
    10,
    "Too many registration attempts from this IP. Please try again later."
  ),

  global: createIPRateLimiter(
    60 * 60 * 1000,
    1000,
    "Too many requests from this IP. Please try again later."
  ),

  chatCompletion: createApiKeyRateLimiter(
    15 * 60 * 1000,
    100,
    "Rate limit exceeded. Please try again later or upgrade your plan."
  ),
};

module.exports = rateLimiters;
