const express = require("express");
const UserController = require("../controllers/userController");
const auth = require("../middleware/auth");
const rateLimiters = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", rateLimiters.register, UserController.register);
router.post("/login", rateLimiters.login, UserController.login);
router.get("/profile", auth, UserController.getProfile);
router.get("/agents", auth, UserController.getAgents);

module.exports = router;
