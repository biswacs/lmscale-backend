const FunctionService = require("../services/functionService");
const functionService = new FunctionService();

const FunctionController = {
  async createFunction(req, res) {
    const userId = req.user.id;
    const {
      assistantId,
      name,
      endpoint,
      method,
      authType,
      parameters,
      metadata,
      isActive,
    } = req.body;

    console.log("[FunctionController] Received create function request", {
      userId,
      assistantId,
    });

    try {
      const requiredFields = [
        "assistantId",
        "name",
        "endpoint",
        "method",
        "authType",
      ];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[FunctionController] Create function failed - missing required fields",
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

      const functionData = {
        assistantId,
        name,
        endpoint,
        method,
        authType,
        parameters,
        metadata,
        isActive,
      };

      const result = await functionService.create(functionData, userId);

      if (!result.success) {
        console.log("[FunctionController] Create function failed", {
          userId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      console.log("[FunctionController] Function created successfully", {
        userId,
        functionId: result.data.function.id,
      });

      return res.status(201).json({
        success: true,
        message: "Function created successfully",
        data: {
          function: result.data.function,
        },
      });
    } catch (error) {
      console.error("[FunctionController] Create function error:", {
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

  async listFunctions(req, res) {
    const userId = req.user.id;
    const assistantId = req.query.assistantId;

    console.log("[FunctionController] Received list functions request", {
      userId,
      assistantId,
    });

    try {
      const result = await functionService.list(assistantId, userId);

      if (!result.success) {
        console.log("[FunctionController] List functions failed", {
          userId,
          assistantId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          functions: result.data.functions,
        },
      });
    } catch (error) {
      console.error("[FunctionController] List functions error:", {
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

  async deleteFunction(req, res) {
    const userId = req.user.id;
    const functionId = req.query.functionId;

    console.log("[FunctionController] Received delete function request", {
      userId,
      functionId,
    });

    try {
      const result = await functionService.delete(functionId, userId);

      if (!result.success) {
        console.log("[FunctionController] Delete function failed", {
          userId,
          functionId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      console.log("[FunctionController] Function deleted successfully", {
        userId,
        functionId,
      });

      return res.status(200).json({
        success: true,
        message: "Function deleted successfully",
      });
    } catch (error) {
      console.error("[FunctionController] Delete function error:", {
        userId,
        functionId,
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

module.exports = FunctionController;
