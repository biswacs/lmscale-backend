const userSchemas = require("../../validation/user/schema");
const UserService = require("../../models/user/user.service");
const userService = new UserService();

const UserController = {
  async register(req, res) {
    console.log("[UserController] Received registration request", {
      email: req.body.email,
    });

    try {
      const validatedData = userSchemas.register.parse(req.body);
      const response = await userService.register(validatedData);

      if (!response.success) {
        console.log("[UserController] Registration failed - validation error", {
          email: req.body.email,
        });
        return res.status(400).json({ message: response.message });
      }

      console.log("[UserController] Registration successful", {
        email: req.body.email,
      });

      res.status(201).json({
        message: response.message,
        lm_auth_token: response.data.lm_auth_token,
        assistantId: response.data.assistantId,
      });
    } catch (error) {
      console.error("[UserController] Registration error:", {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
      });

      if (error.errors) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async login(req, res) {
    console.log("[UserController] Received login request", {
      email: req.body.email,
    });

    try {
      const validatedData = userSchemas.login.parse(req.body);
      const response = await userService.login(
        validatedData.email,
        validatedData.password
      );

      if (!response.success) {
        console.log("[UserController] Login failed", {
          email: req.body.email,
        });
        return res.status(401).json({ message: response.message });
      }

      console.log("[UserController] Login successful", {
        email: req.body.email,
      });

      res.json({
        message: response.message,
        lm_auth_token: response.data.lm_auth_token,
        assistantId: response.data.assistantId,
      });
    } catch (error) {
      console.error("[UserController] Login error:", {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
      });

      if (error.errors) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getProfile(req, res) {
    console.log("[UserController] Received profile request", {
      userId: req.user.id,
    });

    try {
      const response = await userService.getProfile(req.user.id);

      if (!response.success) {
        console.log("[UserController] Profile retrieval failed", {
          userId: req.user.id,
          reason: response.message,
        });
        return res.status(404).json({ message: response.message });
      }

      console.log("[UserController] Profile retrieved successfully", {
        userId: req.user.id,
      });

      res.json({
        message: response.message,
        data: {
          user: response.data.user,
        },
      });
    } catch (error) {
      console.error("[UserController] Profile retrieval error:", {
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = UserController;
