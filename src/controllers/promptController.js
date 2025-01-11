const PromptService = require("../services/promptService");
const promptService = new PromptService();

const PromptController = {
  async getPrompt(req, res) {
    const userId = req.user.id;
    const assistantId = req.query.assistantId;

    console.log("[PromptController] Received get prompt request", {
      userId,
      assistantId,
    });

    try {
      const requiredFields = ["assistantId"];
      const missingFields = requiredFields.filter((field) => !req.query[field]);

      if (missingFields.length > 0) {
        console.log(
          "[PromptController] Get prompt failed - missing required fields",
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

      const response = await promptService.get(assistantId, userId);

      if (!response.success) {
        console.log("[PromptController] Get prompt failed", {
          userId: userId,
          assistantId: assistantId,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[PromptController] Prompt retrieved successfully", {
        userId: userId,
        assistantId: assistantId,
      });

      return res.status(200).json({
        success: true,
        data: {
          data: response.data.assistant,
        },
      });
    } catch (error) {
      console.error("[PromptController] Get prompt error:", {
        userId: userId,
        assistantId: assistantId,
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
    const userId = req.user.id;
    const assistantId = req.body.assistantId;
    const prompt = req.body.prompt;

    console.log("[PromptController] Received update prompt request", {
      userId,
      assistantId,
    });

    try {
      const requiredFields = ["assistantId"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[PromptController] Update prompt failed - missing required fields",
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

      const response = await promptService.update(prompt, assistantId, userId);

      if (!response.success) {
        console.log("[PromptController] Update prompt failed", {
          userId,
          assistantId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[PromptController] Prompt updated successfully", {
        userId: userId,
        assistant: response.data.assistant,
      });

      return res.status(200).json({
        success: true,
        message: "Prompt updated successfully",
        data: {
          assistant: response.data.assistant,
        },
      });
    } catch (error) {
      console.error("[PromptController] Update prompt error:", {
        userId: userId,
        assistantId: req.body.assistantId,
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
