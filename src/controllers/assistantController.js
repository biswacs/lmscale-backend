const AssistantService = require("../services/assistantService");
const assistantService = new AssistantService();

const AssistantController = {
  async createAssistants(req, res) {
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

      const result = await assistantService.create({ name }, userId);

      if (!result.success) {
        console.log("[AssistantController] Assistant creation failed", {
          userId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      console.log("[AssistantController] Assistant created successfully", {
        userId,
        assistant: result.data.assistant,
      });

      return res.status(201).json({
        success: true,
        message: "Assistant created successfully",
        data: {
          assistant: result.data.assistant,
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

  async getAllAssistants(req, res) {
    const userId = req.user.id;

    console.log("[AssistantController] Received user assistants request", {
      userId,
    });

    try {
      const result = await assistantService.list(userId);

      if (!result.success) {
        console.log("[AssistantController] Assistants retrieval failed", {
          userId,
          reason: result.message,
        });
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      console.log("[AssistantController] Assistants retrieved successfully", {
        userId,
        assistantsCount: result.data.assistants.length,
      });

      return res.json({
        success: true,
        message: result.message,
        data: {
          assistants: result.data.assistants,
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
      const result = await assistantService.getOne(assistantId, userId);

      if (!result.success) {
        console.log("[AssistantController] Assistant retrieval failed", {
          userId,
          assistantId,
          reason: result.message,
        });
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      return res.json({
        success: true,
        message: result.message,
        data: {
          assistant: result.data.assistant,
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
};

module.exports = AssistantController;
