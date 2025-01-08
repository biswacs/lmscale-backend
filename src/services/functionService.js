const { Function, Qubit, sequelize } = require("../models");

class FunctionService {
  async create(functionData, userId) {
    const {
      qubitId,
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
      qubitId,
      name,
    });

    const transaction = await sequelize.transaction();

    try {
      const qubit = await Qubit.findOne({
        where: { id: qubitId, userId },
        transaction,
      });

      if (!qubit) {
        console.log("[FunctionService] No qubit found or unauthorized", {
          qubitId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Qubit not found or unauthorized access",
        };
      }

      const existingFunction = await Function.findOne({
        where: { qubitId, name },
        transaction,
      });

      if (existingFunction) {
        console.log("[FunctionService] Function name already exists", {
          qubitId,
          name,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "A function with this name already exists for this qubit",
        };
      }

      const newFunction = await Function.create(
        {
          qubitId,
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
        qubitId,
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
        qubitId,
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

  async list(qubitId, userId) {
    console.log("[FunctionService] Attempting to list functions", {
      qubitId,
      userId,
    });

    try {
      const qubit = await Qubit.findOne({
        where: { id: qubitId, userId },
      });

      if (!qubit) {
        console.log("[FunctionService] Qubit not found or unauthorized", {
          qubitId,
          userId,
        });
        return {
          success: false,
          message: "Qubit not found or unauthorized access",
        };
      }

      const functions = await Function.findAll({
        where: {
          qubitId,
          isActive: true,
        },
        order: [["createdAt", "DESC"]],
      });

      console.log("[FunctionService] Functions retrieved successfully", {
        qubitId,
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
        qubitId,
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

      const qubit = await Qubit.findOne({
        where: {
          id: functionItem.qubitId,
          userId,
        },
      });

      if (!qubit) {
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
