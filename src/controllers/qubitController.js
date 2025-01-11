const QubitService = require("../services/qubitService");
const qubitService = new QubitService();

const QubitController = {
  async create(req, res) {
    const userId = req.user.id;
    const { name } = req.body;

    console.log("[QubitController] Received qubit creation request", {
      userId,
      qubitDetails: { name },
    });

    try {
      const requiredFields = ["name"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[QubitController] Creation failed - missing required fields",
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

      if (name.toLowerCase() === "playground") {
        console.log(
          "[QubitController] Creation failed - 'playground' is a reserved name",
          {
            userId,
          }
        );
        return res.status(400).json({
          success: false,
          message: "'playground' is a reserved name and cannot be used",
        });
      }

      const response = await qubitService.create({ name }, userId);

      if (!response.success) {
        console.log("[QubitController] Qubit creation failed", {
          userId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[QubitController] Qubit created successfully", {
        userId,
        qubit: response.data.qubit,
      });

      return res.status(201).json({
        success: true,
        message: "Qubit created successfully",
        data: {
          qubit: response.data.qubit,
        },
      });
    } catch (error) {
      console.error("[QubitController] Qubit creation error:", {
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

  async getQubits(req, res) {
    const userId = req.user.id;

    console.log("[QubitController] Received user qubits request", {
      userId,
    });

    try {
      const response = await qubitService.list(userId);

      if (!response.success) {
        console.log("[QubitController] Qubits retrieval failed", {
          userId,
          reason: response.message,
        });
        return res.status(404).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[QubitController] Qubits retrieved successfully", {
        userId,
        qubitsCount: response.data.qubits.length,
      });

      return res.json({
        success: true,
        message: response.message,
        data: {
          qubits: response.data.qubits,
        },
      });
    } catch (error) {
      console.error("[QubitController] Qubits retrieval error:", {
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
};

module.exports = QubitController;
