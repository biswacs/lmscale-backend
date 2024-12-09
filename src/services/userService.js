const { User } = require("../models");
const jwt = require("jsonwebtoken");

class UserService {
  generateToken(userId) {
    console.log(`Generating token for user: ${userId}`);
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in environment configuration");
      throw new Error("JWT_SECRET is not configured");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  }

  async createUser({ name = "", email, password }) {
    console.log(`Attempting to create user with email: ${email}`);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`User creation failed - email already exists: ${email}`);
      return { success: false, message: "Email already exists" };
    }

    try {
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
      });

      console.log(`User created successfully with id: ${user.id}`);
      const token = this.generateToken(user.id);
      return {
        success: true,
        data: { token, user },
        message: "User created successfully",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        message: "Failed to create user",
      };
    }
  }

  async authenticateUser(email, password) {
    console.log(`Attempting to authenticate user: ${email}`);

    if (!email || !password) {
      console.log("Authentication failed - missing email or password");
      return { success: false, message: "Email and password are required" };
    }

    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
        isActive: true,
      },
    });

    if (!user) {
      console.log(`Authentication failed - user not found: ${email}`);
      return { success: false, message: "Invalid email" };
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      console.log(
        `Authentication failed - invalid password for user: ${email}`
      );
      return { success: false, message: "Invalid password" };
    }

    console.log(`User authenticated successfully: ${user.id}`);
    const token = this.generateToken(user.id);
    return {
      success: true,
      data: { token, user },
      message: "Login successful",
    };
  }

  async getUserProfile(userId) {
    console.log(`[UserService] Fetching user profile for userId: ${userId}`);

    try {
      const userProfile = await User.findOne({
        where: { id: userId },
        attributes: [
          "id",
          "name",
          "email",
          "metadata",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!userProfile) {
        console.log(`[UserService] Profile not found for userId: ${userId}`);
        return {
          success: false,
          message: "User profile not found",
        };
      }

      console.log(
        `[UserService] Profile retrieved successfully for userId: ${userId}`
      );
      return {
        success: true,
        data: { user: userProfile },
        message: "Profile retrieved successfully",
      };
    } catch (error) {
      console.error("[UserService] Error fetching user profile:", {
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        message: "Failed to retrieve user profile",
      };
    }
  }

  async deactivateUser(userId) {
    console.log(`Attempting to deactivate user: ${userId}`);
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`Deactivation failed - user not found: ${userId}`);
      return { success: false, message: "User not found" };
    }

    await user.update({ isActive: false });
    console.log(`User deactivated successfully: ${userId}`);
    return {
      success: true,
      message: "User deactivated successfully",
    };
  }
}

module.exports = UserService;
