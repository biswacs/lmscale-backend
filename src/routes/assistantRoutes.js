const express = require("express");
const AssistantController = require("../controllers/assistantController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/create", auth, AssistantController.createAssistants);
router.get("/list", auth, AssistantController.getAllAssistants);
router.get("/get", auth, AssistantController.getAssistant);

module.exports = router;
