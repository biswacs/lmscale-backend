const { Op } = require("sequelize");
const { Function, Assistant, sequelize } = require("../index");
const axios = require("axios");

class FunctionService {
  async _testEndpoint(endpoint, method, parameters, testArgs) {
    try {
      const queryValidation = this.validateArguments(
        testArgs,
        parameters.query || {},
        "query"
      );
      const headerValidation = this.validateArguments(
        testArgs,
        parameters.header || {},
        "header"
      );

      const validationErrors = [...queryValidation, ...headerValidation];
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: "Invalid test arguments",
          errors: validationErrors,
        };
      }

      const headers = {};
      const queryParams = {};

      Object.entries(testArgs).forEach(([key, value]) => {
        if (parameters.header && key in parameters.header) {
          headers[key] = value;
        } else if (parameters.query && key in parameters.query) {
          queryParams[key] = value;
        }
      });

      const functionResponse = await axios({
        method: method,
        url: endpoint,
        headers: headers,
        params: queryParams,
        validateStatus: (status) => true,
      });

      const isSuccessful =
        functionResponse.status >= 200 && functionResponse.status < 300;

      return {
        success: isSuccessful,
        data: {
          response: functionResponse.data,
          statusCode: functionResponse.status,
          headers: functionResponse.headers,
        },
        message: isSuccessful
          ? "Function test successful"
          : "Function test failed",
      };
    } catch (error) {
      return {
        success: false,
        message: `Test failed: ${error.message}`,
        error: error,
      };
    }
  }

  validateArguments(args, parameterSchema, location) {
    const errors = [];

    if (!parameterSchema) return errors;

    Object.entries(parameterSchema).forEach(([paramName, paramType]) => {
      if (!(paramName in args)) {
        errors.push(`Missing ${location} parameter: ${paramName}`);
        return;
      }

      if (!this.validateType(args[paramName], paramType)) {
        errors.push(
          `Invalid type for ${location} parameter ${paramName}: expected ${paramType}`
        );
      }
    });

    return errors;
  }

  validateType(value, expectedType) {
    switch (expectedType) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !isNaN(value);
      case "boolean":
        return typeof value === "boolean";
      case "array":
        return Array.isArray(value);
      case "object":
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      default:
        return true;
    }
  }

  async createFunction(functionData, userId) {
    const {
      assistantId,
      name,
      endpoint,
      method,
      authType,
      parameters,
      metadata,
      testArgs,
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

      const testResult = await this._testEndpoint(
        endpoint,
        method.toUpperCase(),
        parameters || {},
        testArgs
      );

      if (!testResult.success) {
        console.log("[FunctionService] Function test failed", {
          error: testResult.message,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Function test failed: " + testResult.message,
          errors: testResult.errors,
        };
      }

      const newFunction = await Function.create(
        {
          assistantId,
          name,
          endpoint,
          method: method.toUpperCase(),
          authType,
          parameters: {
            query: (parameters && parameters.query) || {},
            header: (parameters && parameters.header) || {},
          },
          metadata: metadata || {},
          isActivated: true,
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
          testResult: testResult.data,
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
        error: error.message,
      };
    }
  }

  async updateFunction(functionId, updateData, userId) {
    console.log("[FunctionService] Attempting to update function", {
      functionId,
      userId,
    });

    const transaction = await sequelize.transaction();

    try {
      const functionItem = await Function.findOne({
        where: { id: functionId },
        include: [
          {
            model: Assistant,
            as: "assistant",
            where: { userId },
            attributes: ["id"],
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

      if (updateData.name && updateData.name !== functionItem.name) {
        const existingFunction = await Function.findOne({
          where: {
            assistantId: functionItem.assistantId,
            name: updateData.name,
            id: { [Op.ne]: functionId },
          },
          transaction,
        });

        if (existingFunction) {
          console.log("[FunctionService] Function name already exists", {
            assistantId: functionItem.assistantId,
            name: updateData.name,
          });
          await transaction.rollback();
          return {
            success: false,
            message:
              "A function with this name already exists for this assistant",
          };
        }
      }

      const method = updateData.method?.toUpperCase() || functionItem.method;
      if (!["GET", "POST"].includes(method)) {
        console.log("[FunctionService] Invalid HTTP method provided", {
          functionId,
          method,
        });
        await transaction.rollback();
        return { success: false, message: "Invalid HTTP method" };
      }

      const testResult = await this._testEndpoint(
        updateData.endpoint || functionItem.endpoint,
        method,
        updateData.parameters || functionItem.parameters,
        updateData.testArgs
      );

      if (!testResult.success) {
        console.log("[FunctionService] Function test failed", {
          error: testResult.message,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Function test failed: " + testResult.message,
          errors: testResult.errors,
        };
      }

      if (
        updateData.parameters &&
        (!updateData.parameters.query || !updateData.parameters.header)
      ) {
        await transaction.rollback();
        return {
          success: false,
          message: "Parameters must contain both query and header objects",
        };
      }

      const updatedFields = {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.endpoint && { endpoint: updateData.endpoint }),
        ...(updateData.method && { method }),
        ...(updateData.authType && { authType: updateData.authType }),
        ...(updateData.parameters && {
          parameters: {
            query: updateData.parameters.query || {},
            header: updateData.parameters.header || {},
          },
        }),
        ...(updateData.metadata && { metadata: updateData.metadata }),
        isActivated: true,
      };

      await functionItem.update(updatedFields, { transaction });
      await transaction.commit();

      console.log("[FunctionService] Function updated successfully", {
        functionId,
        userId,
        updatedFields: Object.keys(updatedFields),
      });

      return {
        success: true,
        data: {
          function: functionItem,
          testResult: testResult.data,
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

  async deleteFunction(functionId, userId) {
    console.log("[FunctionService] Attempting to delete function", {
      functionId,
      userId,
    });

    try {
      const functionItem = await Function.findOne({
        where: { id: functionId },
        include: [
          {
            model: Assistant,
            as: "assistant",
            where: { userId: userId },
            attributes: ["id"],
          },
        ],
      });

      if (!functionItem) {
        console.log(
          "[FunctionService] Function not found or unauthorized access",
          {
            functionId,
            userId,
          }
        );
        return {
          success: false,
          message: "Function not found or unauthorized access",
        };
      }

      await functionItem.destroy();

      console.log("[FunctionService] Function deleted successfully", {
        functionId,
        userId,
      });

      return {
        success: true,
        message: "Successfully deleted function",
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
