const { Function, Agent, sequelize } = require("../models");

class FunctionService {
  async create(functionData, userId) {
    const {
      agentId,
      name,
      endpoint,
      method,
      authType,
      parameters,
      metadata,
      isActive = true,
    } = functionData;

    console.log("[FunctionService] Attempting to create function", {
      userId,
      agentId,
      name,
    });

    const transaction = await sequelize.transaction();

    try {
      const agent = await Agent.findOne({
        where: { id: agentId, userId },
        transaction,
      });

      if (!agent) {
        console.log("[FunctionService] No agent found or unauthorized", {
          agentId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      const existingFunction = await Function.findOne({
        where: { agentId, name },
        transaction,
      });

      if (existingFunction) {
        console.log("[FunctionService] Function name already exists", {
          agentId,
          name,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "A function with this name already exists for this agent",
        };
      }

      const newFunction = await Function.create(
        {
          agentId,
          name,
          endpoint,
          method: method.toUpperCase(),
          authType,
          parameters: parameters || {},
          metadata: metadata || {},
          isActive,
        },
        { transaction }
      );

      await transaction.commit();

      console.log("[FunctionService] Function created successfully", {
        functionId: newFunction.id,
        agentId,
        userId,
      });

      return {
        success: true,
        data: {
          function: newFunction,
        },
      };
    } catch (error) {
      console.error("[FunctionService] Error creating function:", {
        userId,
        agentId,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();
      return {
        success: false,
        message: "Failed to create function",
      };
    }
  }

  async list(agentId, userId) {
    console.log("[FunctionService] Attempting to list functions", {
      agentId,
      userId,
    });

    try {
      const agent = await Agent.findOne({
        where: { id: agentId, userId },
      });

      if (!agent) {
        console.log("[FunctionService] Agent not found or unauthorized", {
          agentId,
          userId,
        });
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      const functions = await Function.findAll({
        where: {
          agentId,
          isActive: true,
        },
        order: [["createdAt", "DESC"]],
      });

      console.log("[FunctionService] Functions retrieved successfully", {
        agentId,
        count: functions.length,
      });

      return {
        success: true,
        data: {
          functions,
        },
      };
    } catch (error) {
      console.error("[FunctionService] Error listing functions:", {
        agentId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to list functions",
      };
    }
  }

  async delete(functionId, userId) {
    console.log("[FunctionService] Attempting to delete function", {
      functionId,
      userId,
    });

    try {
      const functionItem = await Function.findOne({
        where: { id: functionId },
      });

      if (!functionItem) {
        console.log("[FunctionService] Function not found", {
          functionId,
          userId,
        });
        return {
          success: false,
          message: "Function not found",
        };
      }

      const agent = await Agent.findOne({
        where: {
          id: functionItem.agentId,
          userId,
        },
      });

      if (!agent) {
        console.log("[FunctionService] Unauthorized access", {
          functionId,
          userId,
        });
        return {
          success: false,
          message: "Unauthorized access",
        };
      }

      await Function.destroy({
        where: { id: functionId },
      });

      console.log("[FunctionService] Function deleted successfully", {
        functionId,
        userId,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("[FunctionService] Error deleting function:", {
        functionId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to delete function",
      };
    }
  }
}

module.exports = FunctionService;
