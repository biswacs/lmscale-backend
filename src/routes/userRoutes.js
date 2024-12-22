const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const rateLimiters = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", rateLimiters.register, userController.register);
router.post(
  "/login",
  (req, res, next) => {
    console.log("⏳ Login request received");
    next();
  },
  rateLimiters.login,
  (req, res, next) => {
    console.log("✅ Passed rate limiter");
    next();
  },
  userController.login
);
router.get("/profile", auth, userController.getProfile);

module.exports = router;
