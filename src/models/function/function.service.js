const { Op } = require("sequelize");
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
        where: { assistantId, name, isActive: true },
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
          isActive: true,
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

  async updateFunction(functionId, updateData, userId) {
    console.log("[FunctionService] Attempting to update function", {
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
        return { success: false, message: "Function not found" };
      }

      const assistant = await Assistant.findOne({
        where: { id: functionItem.assistantId, userId },
      });

      if (!assistant) {
        console.log("[FunctionService] Unauthorized access", {
          functionId,
          userId,
        });
        return { success: false, message: "Unauthorized access" };
      }

      if (updateData.name && updateData.name !== functionItem.name) {
        const existingFunction = await Function.findOne({
          where: {
            assistantId: functionItem.assistantId,
            name: updateData.name,
            id: { [Op.ne]: functionId },
          },
        });

        if (existingFunction) {
          console.log("[FunctionService] Function name already exists", {
            assistantId: functionItem.assistantId,
            name: updateData.name,
          });
          return {
            success: false,
            message:
              "A function with this name already exists for this assistant",
          };
        }
      }

      if (
        updateData.method &&
        !["GET", "POST"].includes(updateData.method.toUpperCase())
      ) {
        console.log("[FunctionService] Invalid HTTP method provided", {
          functionId,
          method: updateData.method,
        });
        return { success: false, message: "Invalid HTTP method" };
      }

      const updatedFields = {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.endpoint && { endpoint: updateData.endpoint }),
        ...(updateData.method && { method: updateData.method.toUpperCase() }),
        ...(updateData.authType && { authType: updateData.authType }),
        ...(updateData.parameters && { parameters: updateData.parameters }),
        ...(updateData.metadata && { metadata: updateData.metadata }),
      };

      await functionItem.update(updatedFields);

      console.log("[FunctionService] Function updated successfully", {
        functionId,
        userId,
        updatedFields: Object.keys(updatedFields),
      });

      return {
        success: true,
        data: { function: functionItem },
      };
    } catch (error) {
      console.error("[FunctionService] Error updating function:", {
        functionId,
        userId,
        error: error.message,
        stack: error.stack,
      });
      return { success: false, message: "Failed to update function" };
    }
  }
}

module.exports = FunctionService;
