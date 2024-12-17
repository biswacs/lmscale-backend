const UserService = require("../services/userService");
const userSchemas = require("../validation/userSchemas");
const userService = new UserService();

const userController = {
  async register(req, res) {
    try {
      const validatedData = userSchemas.register.parse(req.body);

      console.log("[UserController] Registration attempt", {
        name: validatedData.name,
        email: validatedData.email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });

      const result = await userService.createUser(validatedData);

      if (!result.success) {
        console.log("[UserController] Registration failed", {
          email: validatedData.email,
          error: result.message,
          timestamp: new Date().toISOString(),
        });
        return res.status(400).json({ message: result.message });
      }

      console.log("[UserController] Registration successful", {
        userId: result.data.user.id,
        email: validatedData.email,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        message: result.message,
        accessToken: result.data.accessToken,
        user: result.data.user,
      });
    } catch (error) {
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

      console.error("[UserController] Registration failed", {
        email: req.body.email,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async login(req, res) {
    try {
      const validatedData = userSchemas.login.parse(req.body);

      console.log("[UserController] Login attempt", {
        email: validatedData.email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });

      const result = await userService.authenticateUser(
        validatedData.email,
        validatedData.password
      );

      if (!result.success) {
        console.log("[UserController] Login failed", {
          email: validatedData.email,
          error: result.message,
          timestamp: new Date().toISOString(),
        });
        return res.status(401).json({ message: result.message });
      }

      console.log("[UserController] Login successful", {
        email: validatedData.email,
        timestamp: new Date().toISOString(),
      });

      res.json({
        message: result.message,
        accessToken: result.data.accessToken,
      });
    } catch (error) {
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

      console.error("[UserController] Login failed", {
        email: req.body.email,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getProfile(req, res) {
    try {
      console.log("[UserController] Fetching user profile", {
        userId: req.user.id,
        timestamp: new Date().toISOString(),
      });

      const result = await userService.getUserProfile(req.user.id);

      if (!result.success) {
        console.log("[UserController] Get profile failed", {
          userId: req.user.id,
          error: result.message,
          timestamp: new Date().toISOString(),
        });
        return res.status(404).json({ message: result.message });
      }

      res.json({
        message: result.message,
        user: result.data.user,
      });
    } catch (error) {
      console.error("[UserController] Get profile failed", {
        userId: req.user?.id,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = userController;
