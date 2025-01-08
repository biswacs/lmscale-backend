const express = require("express");
const QubitController = require("../controllers/qubitController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/create", auth, QubitController.create);
router.get("/list", auth, QubitController.getQubits);

module.exports = router;
