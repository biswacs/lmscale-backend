const express = require("express");
const InstructionController = require("../controllers/instructionController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create", auth, InstructionController.createInstruction);
router.post("/get", auth, InstructionController.getInstruction);
router.post("/update", auth, InstructionController.updateInstruction);
router.post("/delete", auth, InstructionController.deleteInstruction);
router.get("/list", auth, InstructionController.listInstructions);

module.exports = router;
