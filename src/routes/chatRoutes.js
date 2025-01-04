const express = require("express");
const ChatController = require("../controllers/chatController");
const rateLimiters = require("../middleware/rateLimiter");
const apiKeyAuth = require("../middleware/apiKeyAuth");

const router = express.Router();

router.post(
  "/completion",
  apiKeyAuth,
  rateLimiters.chatCompletion,
  ChatController.chat
);

module.exports = router;
