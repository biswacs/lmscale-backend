const UserService = require("../services/userService");
const userSchemas = require("../validation/userSchemas");
const userService = new UserService();

const UserController = {
  async register(req, res) {
    const startTime = Date.now();

    console.log("[UserController] Received registration request", {
      email: req.body.email,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const validatedData = userSchemas.register.parse(req.body);
      const result = await userService.createUser(validatedData);

      if (!result.success) {
        console.log("[UserController] Registration failed - validation error", {
          email: req.body.email,
          reason: result.message,
          requestId: req.id,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
        return res.status(400).json({ message: result.message });
      }

      console.log("[UserController] Registration successful", {
        userId: result.data.user.id,
        email: result.data.user.email,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        message: result.message,
        accessToken: result.data.accessToken,
        user: result.data.user,
      });
    } catch (error) {
      console.error("[UserController] Registration error:", {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
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
    const startTime = Date.now();

    console.log("[UserController] Received login request", {
      email: req.body.email,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const validatedData = userSchemas.login.parse(req.body);
      const result = await userService.authenticateUser(
        validatedData.email,
        validatedData.password
      );

      if (!result.success) {
        console.log("[UserController] Login failed", {
          email: req.body.email,
          reason: result.message,
          requestId: req.id,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
        return res.status(401).json({ message: result.message });
      }

      console.log("[UserController] Login successful", {
        email: req.body.email,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      res.json({
        message: result.message,
        accessToken: result.data.accessToken,
      });
    } catch (error) {
      console.error("[UserController] Login error:", {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
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
    const startTime = Date.now();

    console.log("[UserController] Received profile request", {
      userId: req.user.id,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await userService.getUserProfile(req.user.id);

      if (!result.success) {
        console.log("[UserController] Profile retrieval failed", {
          userId: req.user.id,
          reason: result.message,
          requestId: req.id,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
        return res.status(404).json({ message: result.message });
      }

      console.log("[UserController] Profile retrieved successfully", {
        userId: req.user.id,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      res.json({
        message: result.message,
        user: result.data.user,
      });
    } catch (error) {
      console.error("[UserController] Profile retrieval error:", {
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async deactivateUser(req, res) {
    const startTime = Date.now();

    console.log("[UserController] Received deactivation request", {
      userId: req.params.userId,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await userService.deactivateUser(req.params.userId);

      if (!result.success) {
        console.log("[UserController] User deactivation failed", {
          userId: req.params.userId,
          reason: result.message,
          requestId: req.id,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
        return res.status(404).json({ message: result.message });
      }

      console.log("[UserController] User deactivated successfully", {
        userId: req.params.userId,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      res.json({ message: result.message });
    } catch (error) {
      console.error("[UserController] Deactivation error:", {
        userId: req.params.userId,
        error: error.message,
        stack: error.stack,
        requestId: req.id,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = UserController;
