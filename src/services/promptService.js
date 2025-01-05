const { Agent, sequelize } = require("../models");

class PromptService {
  async get(body, userId) {
    console.log("[PromptService] Attempting to get prompt", {
      userId,
      agentId: body.agentId,
    });

    try {
      const agent = await Agent.findOne({
        where: {
          id: body.agentId,
          userId: userId,
        },
        attributes: ["id", "prompt"],
      });

      if (!agent) {
        console.log("[PromptService] No agent found", {
          agentId: body.agentId,
          userId,
        });
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      console.log("[PromptService] Prompt retrieved successfully", {
        agentId: agent.id,
        userId,
      });

      return {
        success: true,
        prompt: agent.prompt,
      };
    } catch (error) {
      console.error("[PromptService] Error retrieving prompt:", {
        userId,
        agentId: body.agentId,
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

  async update(body, userId) {
    console.log("[PromptService] Attempting to update prompt", {
      userId,
      agentId: body.agentId,
    });

    const transaction = await sequelize.transaction();

    try {
      const agent = await Agent.findOne({
        where: {
          id: body.agentId,
          userId: userId,
        },
        transaction,
      });

      if (!agent) {
        console.log("[PromptService] No agent found", {
          agentId: body.agentId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      agent.prompt = body.prompt;
      await agent.save({ transaction });
      await transaction.commit();

      console.log("[PromptService] Prompt updated successfully", {
        agentId: agent.id,
        userId,
      });

      return {
        success: true,
        message: "Prompt updated successfully",
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            prompt: agent.prompt,
          },
        },
      };
    } catch (error) {
      console.error("[PromptService] Error updating prompt:", {
        userId,
        agentId: body.agentId,
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
