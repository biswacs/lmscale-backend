const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  console.log("[authMiddleware] Checking JWT authentication");
  try {
    const authHeader = req.header("Authorization");
    console.log(
      "[authMiddleware] Authorization header:",
      authHeader ? "Present" : "Missing"
    );

    if (!authHeader) {
      console.log("[authMiddleware] No authorization header found");
      return res.status(401).json({
        message: "Authorization header missing",
        shouldLogout: true,
      });
    }

    const lm_auth_token = authHeader.replace("Bearer ", "");
    console.log("[authMiddleware] Token extracted, verifying...");

    const decoded = jwt.verify(lm_auth_token, process.env.JWT_SECRET);
    console.log("[authMiddleware] Token verified, user id:", decoded.id);

    console.log("[authMiddleware] Looking up user");
    const user = await User.findOne({
      where: {
        id: decoded.id,
        isActive: true,
      },
      attributes: ["id", "email"],
    });

    if (!user) {
      console.log("[authMiddleware] No active user found");
      return res.status(401).json({
        message: "User not found or inactive",
        shouldLogout: true,
      });
    }

    console.log("[authMiddleware] User authenticated:", {
      userId: user.id,
      email: user.email,
    });

    req.user = user;
    req.lm_auth_token = lm_auth_token;
    next();
  } catch (error) {
    console.error("[authMiddleware] Authentication error:", error);
    res.status(401).json({
      message: "Please authenticate",
      shouldLogout: true,
    });
  }
};

module.exports = authMiddleware;
