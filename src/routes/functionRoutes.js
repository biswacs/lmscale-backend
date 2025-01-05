const express = require("express");
const FunctionController = require("../controllers/functionController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create", auth, FunctionController.createFunction);
router.post("/get", auth, FunctionController.getFunction);
router.post("/update", auth, FunctionController.updateFunction);
router.post("/delete", auth, FunctionController.deleteFunction);
router.get("/list", auth, FunctionController.listFunctions);

module.exports = router;
