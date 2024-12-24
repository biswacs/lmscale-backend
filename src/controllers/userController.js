const UserService = require("../services/userService");
const userSchemas = require("../validation/userSchemas");
const userService = new UserService();
const userController = {
  async register(req, res) {
    try {
      const validatedData = userSchemas.register.parse(req.body);
      const result = await userService.createUser(validatedData);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

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
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async login(req, res) {
    try {
      const validatedData = userSchemas.login.parse(req.body);
      const result = await userService.authenticateUser(
        validatedData.email,
        validatedData.password
      );

      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }

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
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getProfile(req, res) {
    try {
      const result = await userService.getUserProfile(req.user.id);

      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }

      res.json({
        message: result.message,
        user: result.data.user,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = userController;
