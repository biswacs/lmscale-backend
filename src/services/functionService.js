// services/functionService.js
const { Function, Agent, sequelize } = require("../models");

class FunctionService {
  async create(data, userId) {
    console.log("[FunctionService] Attempting to create function", {
      userId,
      agentId: data.agentId,
    });

    const transaction = await sequelize.transaction();

    try {
      // Verify agent ownership
      const agent = await Agent.findOne({
        where: {
          id: data.agentId,
          userId: userId,
        },
        transaction,
      });

      if (!agent) {
        console.log("[FunctionService] No agent found or unauthorized", {
          agentId: data.agentId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      const functionData = {
        name: data.name,
        agentId: data.agentId,
        endpoint: data.endpoint,
        method: data.method.toUpperCase(),
        parameters: data.parameters || {},
        authType: data.authType,
        metadata: data.metadata || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      const newFunction = await Function.create(functionData, { transaction });
      await transaction.commit();

      console.log("[FunctionService] Function created successfully", {
        functionId: newFunction.id,
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
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();
      return {
        success: false,
        message: "Failed to create function",
        error: error.message,
      };
    }
  }

  async get(functionId, userId) {
    console.log("[FunctionService] Attempting to get function", {
      functionId,
      userId,
    });

    try {
      const functionItem = await Function.findOne({
        where: {
          id: functionId,
        },
        include: [
          {
            model: Agent,
            where: { userId },
            attributes: [],
          },
        ],
      });

      if (!functionItem) {
        console.log("[FunctionService] Function not found or unauthorized", {
          functionId,
          userId,
        });
        return {
          success: false,
          message: "Function not found or unauthorized access",
        };
      }

      return {
        success: true,
        data: {
          function: functionItem,
        },
      };
    } catch (error) {
      console.error("[FunctionService] Error getting function:", {
        functionId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to get function",
        error: error.message,
      };
    }
  }

  async update(functionId, data, userId) {
    console.log("[FunctionService] Attempting to update function", {
      functionId,
      userId,
    });

    const transaction = await sequelize.transaction();

    try {
      const functionItem = await Function.findOne({
        where: {
          id: functionId,
        },
        include: [
          {
            model: Agent,
            where: { userId },
            attributes: [],
          },
        ],
        transaction,
      });

      if (!functionItem) {
        console.log("[FunctionService] Function not found or unauthorized", {
          functionId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Function not found or unauthorized access",
        };
      }

      const updateData = {
        ...(data.name && { name: data.name }),
        ...(data.endpoint && { endpoint: data.endpoint }),
        ...(data.method && { method: data.method.toUpperCase() }),
        ...(data.parameters && { parameters: data.parameters }),
        ...(data.authType && { authType: data.authType }),
        ...(data.metadata && { metadata: data.metadata }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      };

      await functionItem.update(updateData, { transaction });
      await transaction.commit();

      console.log("[FunctionService] Function updated successfully", {
        functionId,
        userId,
      });

      return {
        success: true,
        data: {
          function: functionItem,
        },
      };
    } catch (error) {
      console.error("[FunctionService] Error updating function:", {
        functionId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();
      return {
        success: false,
        message: "Failed to update function",
        error: error.message,
      };
    }
  }

  async delete(functionId, userId) {
    console.log("[FunctionService] Attempting to delete function", {
      functionId,
      userId,
    });

    const transaction = await sequelize.transaction();

    try {
      const functionItem = await Function.findOne({
        where: {
          id: functionId,
        },
        include: [
          {
            model: Agent,
            where: { userId },
            attributes: [],
          },
        ],
        transaction,
      });

      if (!functionItem) {
        console.log("[FunctionService] Function not found or unauthorized", {
          functionId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Function not found or unauthorized access",
        };
      }

      await functionItem.destroy({ transaction });
      await transaction.commit();

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

      await transaction.rollback();
      return {
        success: false,
        message: "Failed to delete function",
        error: error.message,
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
        where: {
          id: agentId,
          userId,
        },
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
        error: error.message,
      };
    }
  }
}

module.exports = FunctionService;
