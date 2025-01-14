const InstructionService = require("../../models/instruction/instruction.service");
const instructionService = new InstructionService();

const InstructionController = {
  async createInstruction(req, res) {
    const userId = req.user.id;
    const { assistantId, name, content } = req.body;

    console.log("[InstructionController] Received create instruction request", {
      userId,
      assistantId,
    });

    try {
      const requiredFields = ["assistantId", "name", "content"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[InstructionController] Create instruction failed - missing required fields",
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

      const response = await instructionService.createInstruction(
        {
          assistantId,
          name,
          content,
        },
        userId
      );

      if (!response.success) {
        console.log("[InstructionController] Create instruction failed", {
          userId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Instruction created successfully",
        data: {
          instruction: response.data.instruction,
        },
      });
    } catch (error) {
      console.error("[InstructionController] Create instruction error:", {
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

  async updateInstruction(req, res) {
    const userId = req.user.id;
    const { instructionId, name, content, metadata, isActive } = req.body;

    console.log("[InstructionController] Received update instruction request", {
      userId,
      instructionId,
    });

    try {
      const response = await instructionService.updateInstruction(
        instructionId,
        { name, content, metadata, isActive },
        userId
      );

      if (!response.success) {
        console.log("[InstructionController] Update instruction failed", {
          userId,
          instructionId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Instruction updated successfully",
        data: {
          instruction: response.data.instruction,
        },
      });
    } catch (error) {
      console.error("[InstructionController] Update instruction error:", {
        userId,
        instructionId,
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

module.exports = InstructionController;
