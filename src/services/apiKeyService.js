const { Qubit } = require("../models");

class ApiKeyService {
  async get(userId, qubitId) {
    console.log("[ApiKeyService] Attempting to fetch API key", {
      userId,
      qubitId,
    });

    try {
      const qubit = await Qubit.findOne({
        where: {
          id: qubitId,
          userId: userId,
        },
        attributes: ["id", "name", "apiKey"],
      });

      if (!qubit) {
        console.log("[ApiKeyService] No qubit found", {
          userId,
          qubitId,
        });
        return {
          success: false,
          message: "Qubit not found",
        };
      }

      console.log("[ApiKeyService] API key retrieved successfully", {
        userId,
        qubitId,
      });

      return {
        success: true,
        message: "API key retrieved successfully",
        data: {
          qubit: {
            id: qubit.id,
            name: qubit.name,
            apiKey: qubit.apiKey,
          },
        },
      };
    } catch (error) {
      console.error("[ApiKeyService] Error fetching API key:", {
        userId,
        qubitId,
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
