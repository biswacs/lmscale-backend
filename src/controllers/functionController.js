const FunctionService = require("../services/functionService");
const functionService = new FunctionService();

const FunctionController = {
  async createFunction(req, res) {
    console.log("[FunctionController] Received create function request", {
      userId: req.user.id,
      agentId: req.body.agentId,
    });

    try {
      const requiredFields = [
        "agentId",
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
            userId: req.user.id,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await functionService.create(req.body, req.user.id);

      if (!response.success) {
        console.log("[FunctionController] Create function failed", {
          userId: req.user.id,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[FunctionController] Function created successfully", {
        userId: req.user.id,
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

  async getFunction(req, res) {
    console.log("[FunctionController] Received get function request", {
      userId: req.user.id,
      functionId: req.params.id,
    });

    try {
      const response = await functionService.get(req.params.id, req.user.id);

      if (!response.success) {
        console.log("[FunctionController] Get function failed", {
          userId: req.user.id,
          functionId: req.params.id,
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
          function: response.data.function,
        },
      });
    } catch (error) {
      console.error("[FunctionController] Get function error:", {
        userId: req.user.id,
        functionId: req.params.id,
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
    console.log("[FunctionController] Received update function request", {
      userId: req.user.id,
      functionId: req.params.id,
    });

    try {
      const response = await functionService.update(
        req.params.id,
        req.body,
        req.user.id
      );

      if (!response.success) {
        console.log("[FunctionController] Update function failed", {
          userId: req.user.id,
          functionId: req.params.id,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[FunctionController] Function updated successfully", {
        userId: req.user.id,
        functionId: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: "Function updated successfully",
        data: {
          function: response.data.function,
        },
      });
    } catch (error) {
      console.error("[FunctionController] Update function error:", {
        userId: req.user.id,
        functionId: req.params.id,
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
    console.log("[FunctionController] Received delete function request", {
      userId: req.user.id,
      functionId: req.params.id,
    });

    try {
      const response = await functionService.delete(req.params.id, req.user.id);

      if (!response.success) {
        console.log("[FunctionController] Delete function failed", {
          userId: req.user.id,
          functionId: req.params.id,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[FunctionController] Function deleted successfully", {
        userId: req.user.id,
        functionId: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: "Function deleted successfully",
      });
    } catch (error) {
      console.error("[FunctionController] Delete function error:", {
        userId: req.user.id,
        functionId: req.params.id,
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
    console.log("[FunctionController] Received list functions request", {
      userId: req.user.id,
      agentId: req.query.agentId,
    });

    try {
      const response = await functionService.list(
        req.query.agentId,
        req.user.id
      );

      if (!response.success) {
        console.log("[FunctionController] List functions failed", {
          userId: req.user.id,
          agentId: req.query.agentId,
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
        userId: req.user.id,
        agentId: req.query.agentId,
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
