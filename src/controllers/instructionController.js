const InstructionService = require("../services/instructionService");
const instructionService = new InstructionService();

const InstructionController = {
  async createInstruction(req, res) {
    const userId = req.user.id;
    const { agentId, name, content } = req.body;

    console.log("[InstructionController] Received create instruction request", {
      userId,
      agentId,
    });

    try {
      const requiredFields = ["agentId", "name", "content"];
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

      const response = await instructionService.create(
        {
          agentId,
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

  async listInstructions(req, res) {
    const userId = req.user.id;
    const agentId = req.query.agentId;

    console.log("[InstructionController] Received list instructions request", {
      userId,
      agentId,
    });

    try {
      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: "agentId is required",
        });
      }

      const response = await instructionService.list(agentId, userId);

      if (!response.success) {
        console.log("[InstructionController] List instructions failed", {
          userId,
          agentId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          instructions: response.data.instructions,
        },
      });
    } catch (error) {
      console.error("[InstructionController] List instructions error:", {
        userId,
        agentId,
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
      const response = await instructionService.update(
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

  async deleteInstruction(req, res) {
    const userId = req.user.id;
    const instructionId = req.body.instructionId;

    console.log("[InstructionController] Received delete instruction request", {
      userId,
      instructionId,
    });

    try {
      const response = await instructionService.delete(instructionId, userId);

      if (!response.success) {
        console.log("[InstructionController] Delete instruction failed", {
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
