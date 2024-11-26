const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected routes example
// router.get('/profile', auth, userController.getProfile);

module.exports = router;
