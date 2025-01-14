const express = require("express");
const FunctionController = require("./function.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/create", auth, FunctionController.createFunction);
router.post("/delete", auth, FunctionController.deleteFunction);

module.exports = router;
