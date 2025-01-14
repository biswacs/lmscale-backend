const express = require("express");
const AssistantController = require("./assistant.controller");
const ChatController = require("./chat.controller");
const rateLimiters = require("../../middleware/rateLimiter");
const apiKeyAuth = require("../../middleware/apiKeyAuth");
const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/create", auth, AssistantController.createAssistant);
router.get("/list", auth, AssistantController.allAssistants);
router.get("/get", auth, AssistantController.getAssistant);

router.post(
  "/chat/completion",
  apiKeyAuth,
  rateLimiters.chatCompletion,
  ChatController.chat
);

module.exports = router;
