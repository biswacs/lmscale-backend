const express = require("express");
const FunctionController = require("./function.controller");
const auth = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/create", auth, FunctionController.createFunction);
router.post("/update", auth, FunctionController.updateFunction);
router.post("/delete", auth, FunctionController.deleteFunction);

module.exports = router;
