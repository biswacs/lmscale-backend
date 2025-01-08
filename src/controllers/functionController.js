const FunctionService = require("../services/functionService");
const functionService = new FunctionService();

const FunctionController = {
  async createFunction(req, res) {
    const userId = req.user.id;
    const {
      qubitId,
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
      qubitId,
    });

    try {
      const requiredFields = [
        "qubitId",
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
        qubitId,
        name,
        endpoint,
        method,
        authType,
        parameters,
        metadata,
        isActive,
      };

      const response = await functionService.create(functionData, userId);

      if (!response.success) {
        console.log("[FunctionController] Create function failed", {
          userId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[FunctionController] Function created successfully", {
        userId,
        functionId: response.data.function.id,
      });

      return res.status(201).json({
        success: true,
        message: "Function created successfully",
        data: {
          function: response.data.function,
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
    const qubitId = req.query.qubitId;

    console.log("[FunctionController] Received list functions request", {
      userId,
      qubitId,
    });

    try {
      const response = await functionService.list(qubitId, userId);

      if (!response.success) {
        console.log("[FunctionController] List functions failed", {
          userId,
          qubitId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          functions: response.data.functions,
        },
      });
    } catch (error) {
      console.error("[FunctionController] List functions error:", {
        userId,
        qubitId,
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
      const response = await functionService.delete(functionId, userId);

      if (!response.success) {
        console.log("[FunctionController] Delete function failed", {
          userId,
          functionId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
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
