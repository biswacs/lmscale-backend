const express = require("express");
const InstructionController = require("../controllers/instructionController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create", auth, InstructionController.createInstruction);
router.get("/list", auth, InstructionController.listInstructions);
router.post("/update", auth, InstructionController.updateInstruction);
router.post("/delete", auth, InstructionController.deleteInstruction);

module.exports = router;
