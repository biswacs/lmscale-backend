const AgentService = require("../services/agentService");
const agentService = new AgentService();

const AgentController = {
  async create(req, res) {
    console.log("[AgentController] Received agent creation request", {
      userId: req.user.id,
      agentDetails: {
        name: req.body.name,
      },
    });

    try {
      const requiredFields = ["name"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[AgentController] Creation failed - missing required fields",
          {
            userId: req.user.id,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await agentService.createAgent(req.body, req.user.id);

      if (!response.success) {
        console.log("[AgentController] Agent creation failed", {
          userId: req.user.id,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[AgentController] Agent created successfully", {
        userId: req.user.id,
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
        userId: req.user.id,
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
    console.log("[AgentController] Received user agents request", {
      userId: req.user.id,
    });

    try {
      const result = await agentService.getAllAgents(req.user.id);

      if (!result.success) {
        console.log("[AgentController] Agents retrieval failed", {
          userId: req.user.id,
          reason: result.message,
        });
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      console.log("[AgentController] Agents retrieved successfully", {
        userId: req.user.id,
        agentsCount: result.data.agents.length,
      });

      return res.json({
        success: true,
        message: result.message,
        data: {
          agents: result.data.agents,
        },
      });
    } catch (error) {
      console.error("[AgentController] Agents retrieval error:", {
        userId: req.user.id,
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
