const { Agent, sequelize, Instruction, Function } = require("../models");

class AgentService {
  async createAgent(body, userId) {
    console.log("[AgentService] Attempting to create agent", {
      userId,
      agentDetails: {
        name: body.name,
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

  async updatePrompt(body, userId) {
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
          "apiKey",
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

  async getAgentDatas(userId, agentId) {
    console.log("[AgentService] Fetching agent details", {
      userId,
      agentId,
    });

    try {
      const agent = await Agent.findOne({
        where: {
          id: agentId,
          userId: userId,
        },
        attributes: ["id", "name", "prompt", "apiKey", "config", "isActive"],
      });

      if (!agent) {
        console.log("[AgentService] Agent not found", {
          userId,
          agentId,
        });
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      const instructions = await Instruction.findAll({
        where: { agentId: agentId },
        attributes: ["id", "name", "content"],
      });

      const functions = await Function.findAll({
        where: { agentId: agentId },
        attributes: [
          "name",
          "endpoint",
          "method",
          "parameters",
          "authType",
          "isActive",
        ],
      });

      console.log("[AgentService] Agent details retrieved successfully", {
        userId,
        agentId,
        instructionsCount: instructions.length,
        functionsCount: functions.length,
      });

      return {
        success: true,
        message: "Agent details retrieved successfully",
        data: {
          agent,
          functions,
          instructions,
        },
      };
    } catch (error) {
      console.error("[AgentService] Error fetching agent details:", {
        userId,
        agentId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to retrieve agent details",
        error: error.message,
      };
    }
  }
}

module.exports = AgentService;
