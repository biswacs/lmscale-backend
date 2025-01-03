const { Agent, sequelize } = require("../models");

class AgentService {
  async createAgent(body, userId) {
    console.log("[AgentService] Attempting to create agent", {
      userId,
      agentDetails: {
        name: body.name,
        description: body.description,
      },
    });

    try {
      const existingAgent = await Agent.findOne({
        where: {
          userId,
          name: body.name.toLowerCase(),
        },
      });

      if (existingAgent) {
        console.log("[AgentService] Agent with same name already exists", {
          userId,
          name: body.name,
        });

        return {
          success: false,
          message: "An agent with this name already exists",
        };
      }

      const agent = await Agent.create({
        name: body.name,
        description: body.description,
        userId: userId,
      });

      console.log("[AgentService] Agent created successfully", {
        agentId: agent.id,
        name: agent.name,
      });

      return {
        success: true,
        message: "Agent created successfully",
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
          },
        },
      };
    } catch (error) {
      console.error("[AgentService] Error creating agent:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to create agent",
        error: error.message,
      };
    }
  }

  async setPrompt(body, userId) {
    console.log("[AgentService] Attempting to set prompt", {
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
        console.log("[AgentService] No agent found", {
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

      console.log("[AgentService] Prompt updated successfully", {
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
      console.error("[AgentService] Error updating prompt:", {
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

  async getAllAgents(userId) {
    console.log("[AgentService] Fetching user agents", {
      userId,
    });

    try {
      const agents = await Agent.findAll({
        where: { userId: userId },
        attributes: [
          "id",
          "name",
          "description",
          "prompt",
          "isActive",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!agents || agents.length === 0) {
        console.log("[AgentService] No agents found", {
          userId,
        });
        return {
          success: true,
          message: "No agents found for user",
          data: { agents: [] },
        };
      }

      console.log("[AgentService] Agents retrieved successfully", {
        userId,
        agentsCount: agents.length,
      });

      return {
        success: true,
        message: "Agents retrieved successfully",
        data: { agents },
      };
    } catch (error) {
      console.error("[AgentService] Error fetching user agents:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to retrieve user agents",
      };
    }
  }
}

module.exports = AgentService;
