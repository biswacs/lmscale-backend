const { Agent } = require("../models");

class ApiKeyService {
  async get(userId, agentId) {
    console.log("[ApiKeyService] Attempting to fetch API key", {
      userId,
      agentId,
    });

    try {
      const agent = await Agent.findOne({
        where: {
          id: agentId,
          userId: userId,
        },
        attributes: ["id", "name", "apiKey"],
      });

      if (!agent) {
        console.log("[ApiKeyService] No agent found", {
          userId,
          agentId,
        });
        return {
          success: false,
          message: "Agent not found",
        };
      }

      console.log("[ApiKeyService] API key retrieved successfully", {
        userId,
        agentId,
      });

      return {
        success: true,
        message: "API key retrieved successfully",
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            apiKey: agent.apiKey,
          },
        },
      };
    } catch (error) {
      console.error("[ApiKeyService] Error fetching API key:", {
        userId,
        agentId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to retrieve API key",
        error: error.message,
      };
    }
  }
}

module.exports = ApiKeyService;
