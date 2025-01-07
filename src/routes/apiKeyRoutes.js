const express = require("express");
const ApiKeyController = require("../controllers/apiKeyController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/get", auth, ApiKeyController.getApiKey);

module.exports = router;
