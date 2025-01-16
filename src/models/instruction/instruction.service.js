const { Instruction, Assistant } = require("../index");
const { Op } = require("sequelize");

class InstructionService {
  async createInstruction(instructionData, userId) {
    const { assistantId, name, content } = instructionData;

    console.log("[InstructionService] Attempting to create instruction", {
      userId,
      assistantId,
      name,
    });

    try {
      if (
        !name ||
        typeof name !== "string" ||
        !content ||
        typeof content !== "string"
      ) {
        return {
          success: false,
          message: "Name and content are required and must be strings",
        };
      }

      const assistant = await Assistant.findOne({
        where: { id: assistantId, userId },
      });

      if (!assistant) {
        console.log("[InstructionService] No assistant found or unauthorized", {
          assistantId,
          userId,
        });
        return {
          success: false,
          message: "Assistant not found or unauthorized access",
        };
      }

      const existingInstruction = await Instruction.findOne({
        where: {
          assistantId,
          name,
          isActive: true,
        },
      });

      if (existingInstruction) {
        console.log(
          "[InstructionService] Active instruction with this name already exists",
          {
            assistantId,
            name,
          }
        );
        return {
          success: false,
          message: "This name is already used for another active instruction",
        };
      }

      const newInstruction = await Instruction.create({
        name,
        content,
        assistantId,
        isActive: true,
      });

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

      return {
        success: false,
        message: "Failed to create instruction",
      };
    }
  }

  async updateInstruction(instructionId, updateData, userId) {
    console.log("[InstructionService] Attempting to update instruction", {
      instructionId,
      userId,
    });

    try {
      const instruction = await Instruction.findOne({
        where: { id: instructionId },
      });

      if (!instruction) {
        console.log("[InstructionService] Instruction not found", {
          instructionId,
          userId,
        });
        return {
          success: false,
          message: "Instruction not found",
        };
      }

      const assistant = await Assistant.findOne({
        where: {
          id: instruction.assistantId,
          userId,
        },
      });

      if (!assistant) {
        console.log("[InstructionService] Unauthorized access", {
          instructionId,
          userId,
        });
        return {
          success: false,
          message: "Unauthorized access",
        };
      }

      if (updateData.name && updateData.name !== instruction.name) {
        const existingInstruction = await Instruction.findOne({
          where: {
            assistantId: instruction.assistantId,
            name: updateData.name,
            isActive: true,
            id: {
              [Op.ne]: instructionId,
            },
          },
        });

        if (existingInstruction) {
          console.log(
            "[InstructionService] Active instruction with this name already exists",
            {
              assistantId: instruction.assistantId,
              name: updateData.name,
            }
          );
          return {
            success: false,
            message: "This name is already used for another active instruction",
          };
        }
      }

      const updatedFields = {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.content && { content: updateData.content }),
        ...(updateData.metadata && { metadata: updateData.metadata }),
        ...(updateData.isActive !== undefined && {
          isActive: updateData.isActive,
        }),
      };

      await instruction.update(updatedFields);

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

      return {
        success: false,
        message: "Failed to update instruction",
      };
    }
  }
}

module.exports = InstructionService;
