const PromptService = require("../services/promptService");
const promptService = new PromptService();

const PromptController = {
  async getPrompt(req, res) {
    console.log("[PromptController] Received get prompt request", {
      userId: req.user.id,
      agentId: req.body.agentId,
    });

    try {
      const requiredFields = ["agentId"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[PromptController] Get prompt failed - missing required fields",
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

      const response = await promptService.get(req.body, req.user.id);

      if (!response.success) {
        console.log("[PromptController] Get prompt failed", {
          userId: req.user.id,
          agentId: req.body.agentId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[PromptController] Prompt retrieved successfully", {
        userId: req.user.id,
        agentId: req.body.agentId,
      });

      return res.status(200).json({
        success: true,
        data: {
          prompt: response.prompt,
        },
      });
    } catch (error) {
      console.error("[PromptController] Get prompt error:", {
        userId: req.user.id,
        agentId: req.body.agentId,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async updatePrompt(req, res) {
    console.log("[PromptController] Received update prompt request", {
      userId: req.user.id,
      agentId: req.body.agentId,
    });

    try {
      const requiredFields = ["agentId", "prompt"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[PromptController] Update prompt failed - missing required fields",
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

      const response = await promptService.update(req.body, req.user.id);

      if (!response.success) {
        console.log("[PromptController] Update prompt failed", {
          userId: req.user.id,
          agentId: req.body.agentId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[PromptController] Prompt updated successfully", {
        userId: req.user.id,
        agent: response.data.agent,
      });

      return res.status(200).json({
        success: true,
        message: "Prompt updated successfully",
        data: {
          agent: response.data.agent,
        },
      });
    } catch (error) {
      console.error("[PromptController] Update prompt error:", {
        userId: req.user.id,
        agentId: req.body.agentId,
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

module.exports = PromptController;
