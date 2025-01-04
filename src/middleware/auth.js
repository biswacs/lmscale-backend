const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
  console.log("[auth] Checking JWT authentication");

  try {
    const authHeader = req.header("Authorization");
    console.log(
      "[auth] Authorization header:",
      authHeader ? "Present" : "Missing"
    );

    if (!authHeader) {
      console.log("[auth] No authorization header found");
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const lm_auth_token = authHeader.replace("Bearer ", "");
    console.log("[auth] Token extracted, verifying...");

    const decoded = jwt.verify(lm_auth_token, process.env.JWT_SECRET);
    console.log("[auth] Token verified, user id:", decoded.id);

    console.log("[auth] Looking up user");
    const user = await User.findOne({
      where: {
        id: decoded.id,
        isActive: true,
      },
      attributes: ["id", "email"],
    });

    if (!user) {
      console.log("[auth] No active user found");
      throw new Error();
    }

    console.log("[auth] User authenticated:", {
      userId: user.id,
      email: user.email,
    });
    req.user = user;
    req.lm_auth_token = lm_auth_token;
    next();
  } catch (error) {
    console.error("[auth] Authentication error:", error);
    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = auth;
