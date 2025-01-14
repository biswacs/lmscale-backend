const { Function, Assistant, sequelize } = require("../index");

class FunctionService {
  async createFunction(functionData, userId) {
    const {
      assistantId,
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
      assistantId,
      name,
    });

    const transaction = await sequelize.transaction();

    try {
      const assistant = await Assistant.findOne({
        where: { id: assistantId, userId },
        transaction,
      });

      if (!assistant) {
        console.log("[FunctionService] No assistant found or unauthorized", {
          assistantId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Assistant not found or unauthorized access",
        };
      }

      const existingFunction = await Function.findOne({
        where: { assistantId, name },
        transaction,
      });

      if (existingFunction) {
        console.log("[FunctionService] Function name already exists", {
          assistantId,
          name,
        });
        await transaction.rollback();
        return {
          success: false,
          message:
            "A function with this name already exists for this assistant",
        };
      }

      const newFunction = await Function.create(
        {
          assistantId,
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
        assistantId,
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
        assistantId,
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

  async deleteFunction(functionId, userId) {
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

      const assistant = await Assistant.findOne({
        where: {
          id: functionItem.assistantId,
          userId,
        },
      });

      if (!assistant) {
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
