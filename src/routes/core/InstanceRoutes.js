const express = require("express");
const InstanceController = require("../../controllers/core/instanceController");

const router = express.Router();

router.post("/launch-instance", InstanceController.launchInstance);

module.exports = router;
