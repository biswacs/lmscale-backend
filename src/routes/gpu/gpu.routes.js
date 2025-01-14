const express = require("express");
const GpuController = require("./gpu.controller");
const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/create", auth, GpuController.createGpu);

module.exports = router;
