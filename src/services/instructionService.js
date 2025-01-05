const { Instruction, Agent, sequelize } = require("../models");

class InstructionService {
  async create(data, userId) {
    console.log("[InstructionService] Attempting to create instruction", {
      userId,
      agentId: data.agentId,
    });

    const transaction = await sequelize.transaction();

    try {
      const agent = await Agent.findOne({
        where: {
          id: data.agentId,
          userId: userId,
        },
        transaction,
      });

      if (!agent) {
        console.log("[InstructionService] No agent found or unauthorized", {
          agentId: data.agentId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      const existingInstruction = await Instruction.findOne({
        where: {
          agentId: data.agentId,
        },
        transaction,
      });

      if (existingInstruction) {
        console.log(
          "[InstructionService] Instruction already exists for agent",
          {
            agentId: data.agentId,
            userId,
          }
        );
        await transaction.rollback();
        return {
          success: false,
          message: "An instruction already exists for this agent",
        };
      }

      const instructionData = {
        name: data.name,
        content: data.content,
        agentId: data.agentId,
        metadata: data.metadata || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      const newInstruction = await Instruction.create(instructionData, {
        transaction,
      });
      await transaction.commit();

      console.log("[InstructionService] Instruction created successfully", {
        instructionId: newInstruction.id,
        userId,
      });

      return {
        success: true,
        data: {
          instruction: newInstruction,
        },
      };
    } catch (error) {
      console.error("[InstructionService] Error creating instruction:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();
      return {
        success: false,
        message: "Failed to create instruction",
        error: error.message,
      };
    }
  }

  async get(instructionId, userId) {
    console.log("[InstructionService] Attempting to get instruction", {
      instructionId,
      userId,
    });

    try {
      const instruction = await Instruction.findOne({
        where: {
          id: instructionId,
        },
        include: [
          {
            model: Agent,
            where: { userId },
            attributes: [],
          },
        ],
      });

      if (!instruction) {
        console.log(
          "[InstructionService] Instruction not found or unauthorized",
          {
            instructionId,
            userId,
          }
        );
        return {
          success: false,
          message: "Instruction not found or unauthorized access",
        };
      }

      return {
        success: true,
        data: {
          instruction,
        },
      };
    } catch (error) {
      console.error("[InstructionService] Error getting instruction:", {
        instructionId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to get instruction",
        error: error.message,
      };
    }
  }

  async update(instructionId, data, userId) {
    console.log("[InstructionService] Attempting to update instruction", {
      instructionId,
      userId,
    });

    const transaction = await sequelize.transaction();

    try {
      const instruction = await Instruction.findOne({
        where: {
          id: instructionId,
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

      if (!instruction) {
        console.log(
          "[InstructionService] Instruction not found or unauthorized",
          {
            instructionId,
            userId,
          }
        );
        await transaction.rollback();
        return {
          success: false,
          message: "Instruction not found or unauthorized access",
        };
      }

      const updateData = {
        ...(data.name && { name: data.name }),
        ...(data.content && { content: data.content }),
        ...(data.metadata && { metadata: data.metadata }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      };

      await instruction.update(updateData, { transaction });
      await transaction.commit();

      console.log("[InstructionService] Instruction updated successfully", {
        instructionId,
        userId,
      });

      return {
        success: true,
        data: {
          instruction,
        },
      };
    } catch (error) {
      console.error("[InstructionService] Error updating instruction:", {
        instructionId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();
      return {
        success: false,
        message: "Failed to update instruction",
        error: error.message,
      };
    }
  }

  async delete(instructionId, userId) {
    console.log("[InstructionService] Attempting to delete instruction", {
      instructionId,
      userId,
    });

    const transaction = await sequelize.transaction();

    try {
      const instruction = await Instruction.findOne({
        where: {
          id: instructionId,
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

      if (!instruction) {
        console.log(
          "[InstructionService] Instruction not found or unauthorized",
          {
            instructionId,
            userId,
          }
        );
        await transaction.rollback();
        return {
          success: false,
          message: "Instruction not found or unauthorized access",
        };
      }

      await instruction.destroy({ transaction });
      await transaction.commit();

      console.log("[InstructionService] Instruction deleted successfully", {
        instructionId,
        userId,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("[InstructionService] Error deleting instruction:", {
        instructionId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();
      return {
        success: false,
        message: "Failed to delete instruction",
        error: error.message,
      };
    }
  }

  async list(agentId, userId) {
    console.log("[InstructionService] Attempting to list instructions", {
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
        console.log("[InstructionService] Agent not found or unauthorized", {
          agentId,
          userId,
        });
        return {
          success: false,
          message: "Agent not found or unauthorized access",
        };
      }

      const instructions = await Instruction.findAll({
        where: {
          agentId,
          isActive: true,
        },
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: {
          instructions,
        },
      };
    } catch (error) {
      console.error("[InstructionService] Error listing instructions:", {
        agentId,
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to list instructions",
        error: error.message,
      };
    }
  }
}

module.exports = InstructionService;
