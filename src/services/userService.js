const { User } = require("../models");
const jwt = require("jsonwebtoken");
// hash password and then store
class UserService {
  generateAccessToken(userId) {
    console.log(`Generating accessToken for user: ${userId}`);
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in environment configuration");
      throw new Error("JWT_SECRET is not configured");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  }
  generateRandomUserId(email,name){
    const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const timestamp = Date.now();
    return `${email.slice(0, 2)}${name.slice(0, 2)}${number}${timestamp}`;
  }

  async createUser({ name = "", email, password }) {
    console.log(`Attempting to create user with email: ${email}`);

    try {
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        console.log(`User creation failed - email already exists: ${email}`);
        return { success: false, message: "Email already exists" };
      }
      const encryptedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password:encryptedPassword,
      });

      console.log(`User created successfully with id: ${user.id}`);
      const accessToken = this.generateAccessToken(user.id);
      return {
        success: true,
        data: { accessToken, user },
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

    try {
      if (!email || !password) {
        console.log("Authentication failed - missing email or password");
        return { success: false, message: "Email and password are required" };
      }

      const user = await User.findOne({
        where: {
          email: email.toLowerCase(),
          isActive: true,
        },
        attributes: ["id", "name", "email", "password"],
        raw: false,
      });

      if (!user) {
        console.log(`Authentication failed - user not found: ${email}`);
        return { success: false, message: "Invalid email" };
      }
      const encryptPass= await bcrypt.hash(password,10)
      const isValidPassword = await user.validatePassword(encryptPass);
      if (!isValidPassword) {
        console.log(
          `Authentication failed - invalid password for user: ${email}`
        );
        return { success: false, message: "Invalid password" };
      }

      console.log(`User authenticated successfully: ${user.id}`);

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      const accessToken = generateAccessToken(userData.id);

      if (!accessToken) {
        throw new Error("Failed to generate access token");
      }

      return {
        success: true,
        data: {
          accessToken,
        },
        message: "Login successful",
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        message: "An error occurred during authentication",
        error: error.message,
      };
    }
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
