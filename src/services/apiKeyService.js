const { Assistant } = require("../models");

class ApiKeyService {
  async get(userId, assistantId) {
    console.log("[ApiKeyService] Attempting to fetch API key", {
      userId,
      assistantId,
    });

    try {
      const assistant = await Assistant.findOne({
        where: {
          id: assistantId,
          userId: userId,
        },
        attributes: ["id", "name", "apiKey"],
      });

      if (!assistant) {
        console.log("[ApiKeyService] No assistant found", {
          userId,
          assistantId,
        });
        return {
          success: false,
          message: "Assistant not found",
        };
      }

      console.log("[ApiKeyService] API key retrieved successfully", {
        userId,
        assistantId,
      });

      return {
        success: true,
        message: "API key retrieved successfully",
        data: {
          assistant: {
            id: assistant.id,
            name: assistant.name,
            apiKey: assistant.apiKey,
          },
        },
      };
    } catch (error) {
      console.error("[ApiKeyService] Error fetching API key:", {
        userId,
        assistantId,
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
