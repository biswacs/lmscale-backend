const express = require("express");
const PlaygroundController = require("../controllers/playgroundController");
const rateLimiters = require("../middleware/rateLimiter");
const auth = require("../middleware/auth");

const router = express.Router();

router.post(
  "/conversation",
  auth,
  rateLimiters.global,
  PlaygroundController.createConversation
);

router.get(
  "/conversations",
  auth,
  rateLimiters.global,
  PlaygroundController.listConversations
);

router.post(
  "/chat/completion",
  auth,
  rateLimiters.global,
  PlaygroundController.chat
);

module.exports = router;
