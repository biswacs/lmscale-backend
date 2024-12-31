const express = require("express");
const DeploymentController = require("../controllers/deploymentController");
const rateLimiters = require("../middleware/rateLimiter");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/chat", rateLimiters.global, DeploymentController.chat);

module.exports = router;
