const { Assistant, Instruction, Function, Usage } = require("../models");

class AssistantService {
  async create(assistantData, userId) {
    const { name } = assistantData;

    console.log("[AssistantService] Attempting to create assistant", {
      userId,
      assistantDetails: { name },
    });

    try {
      const existingAssistant = await Assistant.findOne({
        where: {
          userId,
          name: name,
        },
      });

      if (existingAssistant) {
        console.log(
          "[AssistantService] Assistant with same name already exists",
          {
            userId,
            name,
          }
        );

        return {
          success: false,
          message: "An assistant with this name already exists",
        };
      }

      const assistant = await Assistant.create({
        name,
        userId,
      });

      console.log("[AssistantService] Assistant created successfully", {
        assistantId: assistant.id,
        name: assistant.name,
      });

      return {
        success: true,
        message: "Assistant created successfully",
        data: {
          assistant: {
            id: assistant.id,
            name: assistant.name,
          },
        },
      };
    } catch (error) {
      console.error("[AssistantService] Error creating assistant:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to create assistant",
        error: error.message,
      };
    }
  }

  async list(userId) {
    console.log("[AssistantService] Fetching user assistants", {
      userId,
    });

    try {
      const assistants = await Assistant.findAll({
        where: { userId },
        attributes: ["id", "name", "isActive", "createdAt"],
      });

      if (!assistants || assistants.length === 0) {
        console.log("[AssistantService] No assistants found", {
          userId,
        });
        return {
          success: true,
          message: "No assistants found for user",
          data: { assistants: [] },
        };
      }

      console.log("[AssistantService] Assistants retrieved successfully", {
        userId,
        assistantsCount: assistants.length,
      });

      return {
        success: true,
        message: "Assistants retrieved successfully",
        data: { assistants },
      };
    } catch (error) {
      console.error("[AssistantService] Error fetching user assistants:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to retrieve user assistants",
      };
    }
  }

  async getOne(assistantId, userId) {
    console.log("[AssistantService] Fetching assistant details", {
      assistantId,
      userId,
    });

    try {
      const assistant = await Assistant.findOne({
        where: {
          id: assistantId,
          userId,
        },
        include: [
          {
            model: Instruction,
            as: "instructions",
            where: { isActive: true },
            required: false,
            attributes: ["id", "name", "content", "metadata", "createdAt"],
          },
          {
            model: Function,
            as: "functions",
            where: { isActive: true },
            required: false,
            attributes: [
              "id",
              "name",
              "endpoint",
              "method",
              "parameters",
              "authType",
              "metadata",
              "createdAt",
            ],
          },
        ],
        attributes: [
          "id",
          "name",
          "prompt",
          "apiKey",
          "config",
          "isActive",
          "createdAt",
        ],
      });

      if (!assistant) {
        console.log("[AssistantService] Assistant not found", {
          assistantId,
          userId,
        });
        return {
          success: false,
          message: "Assistant not found",
        };
      }

      const usages = await Usage.findAll({
        where: {
          assistantId: assistant.id,
        },
        order: [["createdAt", "DESC"]],
      });

      const formattedAssistant = {
        id: assistant.id,
        name: assistant.name,
        prompt: assistant.prompt,
        apiKey: assistant.apiKey,
        config: assistant.config,
        isActive: assistant.isActive,
        createdAt: assistant.createdAt,
        instructions: assistant.instructions || [],
        functions: assistant.functions || [],
        usages: usages || [],
      };

      return {
        success: true,
        message: "Assistant retrieved successfully",
        data: {
          assistant: formattedAssistant,
        },
      };
    } catch (error) {
      console.error("[AssistantService] Error fetching assistant:", {
        assistantId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to retrieve assistant",
      };
    }
  }
}

module.exports = AssistantService;
