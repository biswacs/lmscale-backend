const InstructionService = require("../services/instructionService");
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

      const result = await instructionService.create(
        {
          assistantId,
          name,
          content,
        },
        userId
      );

      if (!result.success) {
        console.log("[InstructionController] Create instruction failed", {
          userId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Instruction created successfully",
        data: {
          instruction: result.data.instruction,
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

  async listInstructions(req, res) {
    const userId = req.user.id;
    const assistantId = req.query.assistantId;

    console.log("[InstructionController] Received list instructions request", {
      userId,
      assistantId,
    });

    try {
      if (!assistantId) {
        return res.status(400).json({
          success: false,
          message: "assistantId is required",
        });
      }

      const result = await instructionService.list(assistantId, userId);

      if (!result.success) {
        console.log("[InstructionController] List instructions failed", {
          userId,
          assistantId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          instructions: result.data.instructions,
        },
      });
    } catch (error) {
      console.error("[InstructionController] List instructions error:", {
        userId,
        assistantId,
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
      const result = await instructionService.update(
        instructionId,
        { name, content, metadata, isActive },
        userId
      );

      if (!result.success) {
        console.log("[InstructionController] Update instruction failed", {
          userId,
          instructionId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Instruction updated successfully",
        data: {
          instruction: result.data.instruction,
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

  async deleteInstruction(req, res) {
    const userId = req.user.id;
    const instructionId = req.body.instructionId;

    console.log("[InstructionController] Received delete instruction request", {
      userId,
      instructionId,
    });

    try {
      const result = await instructionService.delete(instructionId, userId);

      if (!result.success) {
        console.log("[InstructionController] Delete instruction failed", {
          userId,
          instructionId,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Instruction deleted successfully",
      });
    } catch (error) {
      console.error("[InstructionController] Delete instruction error:", {
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
