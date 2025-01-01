const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const lm_auth_token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(lm_auth_token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: {
        id: decoded.id,
        isActive: true,
      },
      attributes: ["id", "email"],
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.lm_auth_token = lm_auth_token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = auth;
