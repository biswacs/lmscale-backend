const express = require("express");
const PromptController = require("../controllers/promptController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/get", auth, PromptController.getPrompt);
router.post("/update", auth, PromptController.updatePrompt);

module.exports = router;
