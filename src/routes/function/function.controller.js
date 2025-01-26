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
      testArgs,
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
        "testArgs",
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
        testArgs,
      };

      const response = await functionService.createFunction(
        functionData,
        userId
      );

      if (!response.success) {
        console.log("[FunctionController] Create function failed", {
          userId,
          reason: response.message,
          errors: response.errors,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
          errors: response.errors,
          error: response.error,
        });
      }

      console.log("[FunctionController] Function created successfully", {
        userId,
        functionId: response.data.function.id,
      });

      return res.status(201).json({
        success: true,
        message: "Function created and tested successfully",
        data: {
          function: response.data.function,
          testResult: response.data.testResult,
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
      testArgs,
    } = req.body;

    console.log("[FunctionController] Received update function request", {
      userId,
      functionId,
    });

    try {
      if (!functionId || !testArgs) {
        console.log(
          "[FunctionController] Update function failed - missing required fields",
          {
            userId,
            missing: !functionId ? "functionId" : "testArgs",
          }
        );
        return res.status(400).json({
          success: false,
          message: !functionId
            ? "Function ID is required"
            : "Test arguments are required",
        });
      }

      const response = await functionService.updateFunction(
        functionId,
        { name, endpoint, method, authType, parameters, metadata, testArgs },
        userId
      );

      if (!response.success) {
        console.log("[FunctionController] Update function failed", {
          userId,
          functionId,
          reason: response.message,
          errors: response.errors,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
          errors: response.errors,
          error: response.error,
        });
      }

      console.log("[FunctionController] Function updated successfully", {
        userId,
        functionId,
      });

      return res.status(200).json({
        success: true,
        message: "Function updated and tested successfully",
        data: {
          function: response.data.function,
          testResult: response.data.testResult,
        },
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

  async deleteFunction(req, res) {
    const userId = req.user.id;
    const { functionId } = req.query;

    console.log("[FunctionController] Received delete function request", {
      userId,
      functionId,
    });

    try {
      if (!functionId) {
        console.log(
          "[FunctionController] Delete function failed - missing functionId",
          {
            userId,
          }
        );
        return res.status(400).json({
          success: false,
          message: "Function ID is required",
        });
      }

      const response = await functionService.deleteFunction(functionId, userId);

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
