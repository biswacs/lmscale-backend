const express = require("express");
const AssistantController = require("./assistant.controller");
const ChatController = require("./chat.controller");
const limiterMiddlewares = require("../../middleware/limiter.middleware");
const apiMiddleware = require("../../middleware/api.middleware");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/create", authMiddleware, AssistantController.createAssistant);
router.get("/list", authMiddleware, AssistantController.allAssistants);
router.get("/get", authMiddleware, AssistantController.getAssistant);
router.post("/update/prompt", authMiddleware, AssistantController.updatePrompt);

router.post(
  "/chat/completion",
  apiMiddleware,
  limiterMiddlewares.chatCompletion,
  ChatController.chat
);

module.exports = router;
