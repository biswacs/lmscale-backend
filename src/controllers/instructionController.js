const InstructionService = require("../services/instructionService");
const instructionService = new InstructionService();

const InstructionController = {
  async createInstruction(req, res) {
    console.log("[InstructionController] Received create instruction request", {
      userId: req.user.id,
      agentId: req.body.agentId,
    });

    try {
      const requiredFields = ["agentId", "name", "content"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[InstructionController] Create instruction failed - missing required fields",
          {
            userId: req.user.id,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await instructionService.create(req.body, req.user.id);

      if (!response.success) {
        console.log("[InstructionController] Create instruction failed", {
          userId: req.user.id,
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
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async getInstruction(req, res) {
    console.log("[InstructionController] Received get instruction request", {
      userId: req.user.id,
      instructionId: req.params.id,
    });

    try {
      const response = await instructionService.get(req.params.id, req.user.id);

      if (!response.success) {
        console.log("[InstructionController] Get instruction failed", {
          userId: req.user.id,
          instructionId: req.params.id,
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
          instruction: response.data.instruction,
        },
      });
    } catch (error) {
      console.error("[InstructionController] Get instruction error:", {
        userId: req.user.id,
        instructionId: req.params.id,
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
    console.log("[InstructionController] Received update instruction request", {
      userId: req.user.id,
      instructionId: req.params.id,
    });

    try {
      const response = await instructionService.update(
        req.params.id,
        req.body,
        req.user.id
      );

      if (!response.success) {
        console.log("[InstructionController] Update instruction failed", {
          userId: req.user.id,
          instructionId: req.params.id,
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
        userId: req.user.id,
        instructionId: req.params.id,
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
    console.log("[InstructionController] Received delete instruction request", {
      userId: req.user.id,
      instructionId: req.params.id,
    });

    try {
      const response = await instructionService.delete(
        req.params.id,
        req.user.id
      );

      if (!response.success) {
        console.log("[InstructionController] Delete instruction failed", {
          userId: req.user.id,
          instructionId: req.params.id,
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
        userId: req.user.id,
        instructionId: req.params.id,
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
    console.log("[InstructionController] Received list instructions request", {
      userId: req.user.id,
      agentId: req.query.agentId,
    });

    try {
      if (!req.query.agentId) {
        return res.status(400).json({
          success: false,
          message: "agentId is required",
        });
      }

      const response = await instructionService.list(
        req.query.agentId,
        req.user.id
      );

      if (!response.success) {
        console.log("[InstructionController] List instructions failed", {
          userId: req.user.id,
          agentId: req.query.agentId,
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
        userId: req.user.id,
        agentId: req.query.agentId,
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
