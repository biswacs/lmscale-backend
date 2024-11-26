const { User } = require("../models");
const jwt = require("jsonwebtoken");

const userController = {
  async register(req, res, next) {
    try {
      const { name, email, password, userType, usageTier } = req.body;

      const user = await User.create({
        name,
        email,
        password,
        metadata: {
          userType,
          usageTier,
          description:
            userType === "FOUNDER"
              ? "Building an AI-powered product"
              : "Integrating LLMs into applications",
        },
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          metadata: user.metadata,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          metadata: user.metadata,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
