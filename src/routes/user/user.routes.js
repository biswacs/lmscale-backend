const express = require("express");
const UserController = require("./user.controller");
const auth = require("../../middleware/auth.middleware");
const rateLimiters = require("../../middleware/limiter.middleware");

const router = express.Router();

router.post("/register", rateLimiters.register, UserController.register);
router.post("/login", rateLimiters.login, UserController.login);
router.get("/profile", auth, UserController.getProfile);

module.exports = router;
