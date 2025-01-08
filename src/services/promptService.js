const { Qubit, sequelize } = require("../models");

class PromptService {
  async get(qubitId, userId) {
    console.log("[PromptService] Attempting to get prompt", {
      userId,
      qubitId,
    });

    try {
      const qubit = await Qubit.findOne({
        where: {
          id: qubitId,
          userId: userId,
        },
        attributes: ["id", "prompt"],
      });

      if (!qubit) {
        console.log("[PromptService] No qubit found", {
          qubitId: qubitId,
          userId,
        });
        return {
          success: false,
          message: "Qubit not found or unauthorized access",
        };
      }

      console.log("[PromptService] Prompt retrieved successfully", {
        qubitId: qubit.id,
        userId,
      });

      return {
        success: true,
        prompt: qubit.prompt,
      };
    } catch (error) {
      console.error("[PromptService] Error retrieving prompt:", {
        userId,
        qubitId: qubitId,
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

  async update(prompt, qubitId, userId) {
    console.log("[PromptService] Attempting to update prompt", {
      qubitId,
      userId,
    });

    const transaction = await sequelize.transaction();

    try {
      const qubit = await Qubit.findOne({
        where: {
          id: qubitId,
          userId: userId,
        },
        transaction,
      });

      if (!qubit) {
        console.log("[PromptService] No qubit found", {
          qubitId: qubitId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Qubit not found or unauthorized access",
        };
      }

      qubit.prompt = prompt;
      await qubit.save({ transaction });
      await transaction.commit();

      console.log("[PromptService] Prompt updated successfully", {
        qubitId: qubit.id,
        userId,
      });

      return {
        success: true,
        message: "Prompt updated successfully",
        data: {
          qubit: {
            id: qubit.id,
            name: qubit.name,
            prompt: qubit.prompt,
          },
        },
      };
    } catch (error) {
      console.error("[PromptService] Error updating prompt:", {
        userId,
        qubitId,
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
