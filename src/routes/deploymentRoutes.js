const express = require("express");
const DeploymentController = require("../controllers/deploymentController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/create", auth, DeploymentController.create);

module.exports = router;
