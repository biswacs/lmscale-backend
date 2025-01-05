const express = require("express");
const FunctionController = require("../controllers/functionController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create", auth, FunctionController.createFunction);
router.get("/list", auth, FunctionController.listFunctions);
router.post("/delete", auth, FunctionController.deleteFunction);

module.exports = router;
