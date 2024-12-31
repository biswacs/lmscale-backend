const express = require("express");
const ChatController = require("../controllers/chatController");
const rateLimiters = require("../middleware/rateLimiter");
const auth = require("../middleware/auth");

const router = express.Router();

router.post(
  "/completion",
  auth,
  rateLimiters.global,
  ChatController.completion
);

module.exports = router;
