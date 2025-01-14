const AssistantService = require("../../models/assistant/assistant.service");
const assistantService = new AssistantService();

const AssistantController = {
  async createAssistant(req, res) {
    const userId = req.user.id;
    const { name } = req.body;

    console.log("[AssistantController] Received assistant creation request", {
      userId,
      assistantDetails: { name },
    });

    try {
      const requiredFields = ["name"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[AssistantController] Creation failed - missing required fields",
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

      if (name.toLowerCase() === "playground") {
        console.log(
          "[AssistantController] Creation failed - 'playground' is a reserved name",
          {
            userId,
          }
        );
        return res.status(400).json({
          success: false,
          message: "'playground' is a reserved name and cannot be used",
        });
      }

      if (name.length > 14) {
        console.log(
          "[AssistantController] Creation failed - The assistant name cannot exceed 14 characters in length",
          {
            userId,
          }
        );
        return res.status(400).json({
          success: false,
          message: "The assistant name cannot exceed 14 characters in length",
        });
      }

      const response = await assistantService.createAssistant({ name }, userId);

      if (!response.success) {
        console.log("[AssistantController] Assistant creation failed", {
          userId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[AssistantController] Assistant created successfully", {
        userId,
        assistant: response.data.assistant,
      });

      return res.status(201).json({
        success: true,
        message: "Assistant created successfully",
        data: {
          assistant: response.data.assistant,
        },
      });
    } catch (error) {
      console.error("[AssistantController] Assistant creation error:", {
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

  async allAssistants(req, res) {
    const userId = req.user.id;

    console.log("[AssistantController] Received user assistants request", {
      userId,
    });

    try {
      const response = await assistantService.allAssistants(userId);

      if (!response.success) {
        console.log("[AssistantController] Assistants retrieval failed", {
          userId,
          reason: response.message,
        });
        return res.status(404).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[AssistantController] Assistants retrieved successfully", {
        userId,
        assistantsCount: response.data.assistants.length,
      });

      return res.json({
        success: true,
        message: response.message,
        data: {
          assistants: response.data.assistants,
        },
      });
    } catch (error) {
      console.error("[AssistantController] Assistants retrieval error:", {
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

  async getAssistant(req, res) {
    const userId = req.user.id;
    const assistantId = req.query.assistantId;

    console.log("[AssistantController] Received single assistant request", {
      userId,
      assistantId,
    });

    try {
      const response = await assistantService.getAssistant(assistantId, userId);

      if (!response.success) {
        console.log("[AssistantController] Assistant retrieval failed", {
          userId,
          assistantId,
          reason: response.message,
        });
        return res.status(404).json({
          success: false,
          message: response.message,
        });
      }

      return res.json({
        success: true,
        message: response.message,
        data: {
          assistant: response.data.assistant,
        },
      });
    } catch (error) {
      console.error("[AssistantController] Assistant retrieval error:", {
        userId,
        assistantId,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async getApiKey(req, res) {
    const userId = req.user.id;
    const assistantId = req.query.assistantId;

    console.log("[ApiKeyController] Received API key fetch request", {
      userId,
      assistantId,
    });

    try {
      if (!assistantId) {
        console.log("[ApiKeyController] Missing assistant ID", {
          userId,
        });
        return res.status(400).json({
          success: false,
          message: "Missing required parameter: assistantId",
        });
      }

      const response = await assistantService.getApiKey(userId, assistantId);

      if (!response.success) {
        console.log("[ApiKeyController] API key fetch failed", {
          userId,
          assistantId,
          reason: response.message,
        });
        return res.status(404).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[ApiKeyController] API key fetched successfully", {
        userId,
        assistantId,
      });

      return res.status(200).json({
        success: true,
        message: "API key retrieved successfully",
        data: response.data,
      });
    } catch (error) {
      console.error("[ApiKeyController] API key fetch error:", {
        userId,
        assistantId,
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

      const response = await assistantService.updatePrompt(
        prompt,
        assistantId,
        userId
      );

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

module.exports = AssistantController;
