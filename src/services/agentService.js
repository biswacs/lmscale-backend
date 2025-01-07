const { Agent } = require("../models");

class AgentService {
  async create(agentData, userId) {
    const { name } = agentData;

    console.log("[AgentService] Attempting to create agent", {
      userId,
      agentDetails: { name },
    });

    try {
      const existingAgent = await Agent.findOne({
        where: {
          userId,
          name: name,
        },
      });

      if (existingAgent) {
        console.log("[AgentService] Agent with same name already exists", {
          userId,
          name,
        });

        return {
          success: false,
          message: "An agent with this name already exists",
        };
      }

      const agent = await Agent.create({
        name,
        userId,
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
            apiKey: agent.apiKey,
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

  async list(userId) {
    console.log("[AgentService] Fetching user agents", {
      userId,
    });

    try {
      const agents = await Agent.findAll({
        where: { userId },
        attributes: ["id", "name", "isActive", "createdAt"],
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
