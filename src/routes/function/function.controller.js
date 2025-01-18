const FunctionService = require("../../models/function/function.service");
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

      const response = await functionService.createFunction(
        functionData,
        userId
      );

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

  async updateFunction(req, res) {
    const userId = req.user.id;
    const {
      functionId,
      name,
      endpoint,
      method,
      authType,
      parameters,
      metadata,
      isActive,
    } = req.body;

    console.log("[FunctionController] Received update function request", {
      userId,
      functionId,
    });

    try {
      if (!functionId) {
        console.log(
          "[FunctionController] Update function failed - missing functionId",
          {
            userId,
          }
        );
        return res.status(400).json({
          success: false,
          message: "Function ID is required",
        });
      }

      const response = await functionService.updateFunction(
        functionId,
        { name, endpoint, method, authType, parameters, metadata, isActive },
        userId
      );

      if (!response.success) {
        console.log("[FunctionController] Update function failed", {
          userId,
          functionId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[FunctionController] Function updated successfully", {
        userId,
        functionId,
      });

      return res.status(200).json({
        success: true,
        message: "Function updated successfully",
        data: { function: response.data.function },
      });
    } catch (error) {
      console.error("[FunctionController] Update function error:", {
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
