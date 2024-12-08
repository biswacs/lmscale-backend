const UserService = require("../services/userService");
const userService = new UserService();

const userController = {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      console.log("[UserController] Registration attempt", {
        name,
        email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });

      const result = await userService.createUser({ name, email, password });

      if (!result.success) {
        console.log("[UserController] Registration failed", {
          email,
          error: result.message,
          timestamp: new Date().toISOString(),
        });
        return res.status(400).json({ message: result.message });
      }

      console.log("[UserController] Registration successful", {
        userId: result.data.user.id,
        email,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        message: result.message,
        token: result.data.token,
        user: result.data.user,
      });
    } catch (error) {
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
      const { email, password } = req.body;
      console.log("[UserController] Login attempt", {
        email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      });

      const result = await userService.authenticateUser(email, password);

      if (!result.success) {
        console.log("[UserController] Login failed", {
          email,
          error: result.message,
          timestamp: new Date().toISOString(),
        });
        return res.status(401).json({ message: result.message });
      }

      console.log("[UserController] Login successful", {
        userId: result.data.user.id,
        email,
        timestamp: new Date().toISOString(),
      });

      res.json({
        message: result.message,
        token: result.data.token,
        user: result.data.user,
      });
    } catch (error) {
      console.error("[UserController] Login failed", {
        email: req.body.email,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = userController;
