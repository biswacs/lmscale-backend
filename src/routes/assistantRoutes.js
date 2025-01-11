const express = require("express");
const AssistantController = require("../controllers/assistantController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/create", auth, AssistantController.create);
router.get("/list", auth, AssistantController.getAssistants);

module.exports = router;
