const { Assistant, sequelize } = require("../models");

class PromptService {
  async get(assistantId, userId) {
    console.log("[PromptService] Attempting to get prompt", {
      userId,
      assistantId,
    });

    try {
      const assistant = await Assistant.findOne({
        where: {
          id: assistantId,
          userId: userId,
        },
        attributes: ["id", "name", "prompt"],
      });

      if (!assistant) {
        console.log("[PromptService] No assistant found", {
          assistantId: assistantId,
          userId,
        });
        return {
          success: false,
          message: "Assistant not found or unauthorized access",
        };
      }

      console.log("[PromptService] Prompt retrieved successfully", {
        assistantId: assistant.id,
        userId,
      });

      return {
        success: true,
        data: {
          assistant,
        },
      };
    } catch (error) {
      console.error("[PromptService] Error retrieving prompt:", {
        userId,
        assistantId: assistantId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to retrieve prompt",
        error: error.message,
      };
    }
  }

  async update(prompt, assistantId, userId) {
    console.log("[PromptService] Attempting to update prompt", {
      assistantId,
      userId,
    });

    const transaction = await sequelize.transaction();

    try {
      const assistant = await Assistant.findOne({
        where: {
          id: assistantId,
          userId: userId,
        },
        transaction,
      });

      if (!assistant) {
        console.log("[PromptService] No assistant found", {
          assistantId: assistantId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Assistant not found or unauthorized access",
        };
      }

      const updatedPrompt =
        prompt.trim() === ""
          ? Assistant.getAttributes().prompt.defaultValue
          : prompt;

      assistant.prompt = updatedPrompt;
      await assistant.save({ transaction });
      await transaction.commit();

      console.log("[PromptService] Prompt updated successfully", {
        assistantId: assistant.id,
        userId,
      });

      return {
        success: true,
        message: "Prompt updated successfully",
        data: {
          assistant: {
            id: assistant.id,
            name: assistant.name,
            prompt: assistant.prompt,
          },
        },
      };
    } catch (error) {
      console.error("[PromptService] Error updating prompt:", {
        userId,
        assistantId,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();

      return {
        success: false,
        message: "Failed to update prompt",
        error: error.message,
      };
    }
  }
}

module.exports = PromptService;
