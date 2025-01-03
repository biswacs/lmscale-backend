const express = require("express");
const ConversationController = require("../controllers/conversationController");
const rateLimiters = require("../middleware/rateLimiter");
const auth = require("../middleware/auth");

const router = express.Router();

router.get(
  "/list",
  auth,
  rateLimiters.global,
  ConversationController.listConversations
);

router.get(
  "/:conversationId/messages",
  auth,
  rateLimiters.global,
  ConversationController.getConversationMessages
);

module.exports = router;
