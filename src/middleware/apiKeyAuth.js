const { Agent } = require("../models");

const apiKeyAuth = async (req, res, next) => {
  console.log("[apiKeyAuth] Checking API key authentication");

  const apiKey = req.headers["x-api-key"];
  console.log(
    "[apiKeyAuth] API Key received:",
    apiKey ? `${apiKey.substring(0, 8)}...` : "none"
  );

  if (!apiKey) {
    console.log("[apiKeyAuth] No API key provided");
    return res.status(401).json({
      success: false,
      message: "API key is required",
    });
  }

  try {
    console.log("[apiKeyAuth] Looking up agent with API key");
    const agent = await Agent.findOne({
      where: {
        apiKey,
        isActive: true,
      },
    });

    if (!agent) {
      console.log("[apiKeyAuth] No active agent found with provided API key");
      return res.status(401).json({
        success: false,
        message: "Invalid API key or inactive agent",
      });
    }

    console.log("[apiKeyAuth] Agent found:", { agentId: agent.id });
    req.agentId = agent.id;
    next();
  } catch (error) {
    console.error("[apiKeyAuth] Error during authentication:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = apiKeyAuth;
