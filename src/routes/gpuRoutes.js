const express = require("express");
const GpuController = require("../controllers/gpuController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create", auth, GpuController.create);

module.exports = router;
