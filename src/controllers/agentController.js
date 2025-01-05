const AgentService = require("../services/agentService");
const agentService = new AgentService();

const AgentController = {
  async create(req, res) {
    const userId = req.user.id;
    const { name } = req.body;

    console.log("[AgentController] Received agent creation request", {
      userId,
      agentDetails: { name },
    });

    try {
      const requiredFields = ["name"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[AgentController] Creation failed - missing required fields",
          {
            userId,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await agentService.create({ name }, userId);

      if (!response.success) {
        console.log("[AgentController] Agent creation failed", {
          userId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[AgentController] Agent created successfully", {
        userId,
        agent: response.data.agent,
      });

      return res.status(201).json({
        success: true,
        message: "Agent created successfully",
        data: {
          agent: response.data.agent,
        },
      });
    } catch (error) {
      console.error("[AgentController] Agent creation error:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async getAgents(req, res) {
    const userId = req.user.id;

    console.log("[AgentController] Received user agents request", {
      userId,
    });

    try {
      const response = await agentService.list(userId);

      if (!response.success) {
        console.log("[AgentController] Agents retrieval failed", {
          userId,
          reason: response.message,
        });
        return res.status(404).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[AgentController] Agents retrieved successfully", {
        userId,
        agentsCount: response.data.agents.length,
      });

      return res.json({
        success: true,
        message: response.message,
        data: {
          agents: response.data.agents,
        },
      });
    } catch (error) {
      console.error("[AgentController] Agents retrieval error:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = AgentController;
