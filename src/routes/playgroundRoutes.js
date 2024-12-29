const express = require("express");
const PlaygroundController = require("../controllers/playgroundController");
const rateLimiters = require("../middleware/rateLimiter");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/chat", auth, rateLimiters.global, PlaygroundController.chat);

module.exports = router;
