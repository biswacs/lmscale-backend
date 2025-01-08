const { Qubit } = require("../models");

class QubitService {
  async create(qubitData, userId) {
    const { name } = qubitData;

    console.log("[QubitService] Attempting to create qubit", {
      userId,
      qubitDetails: { name },
    });

    try {
      const existingQubit = await Qubit.findOne({
        where: {
          userId,
          name: name,
        },
      });

      if (existingQubit) {
        console.log("[QubitService] Qubit with same name already exists", {
          userId,
          name,
        });

        return {
          success: false,
          message: "An qubit with this name already exists",
        };
      }

      const qubit = await Qubit.create({
        name,
        userId,
      });

      console.log("[QubitService] Qubit created successfully", {
        qubitId: qubit.id,
        name: qubit.name,
      });

      return {
        success: true,
        message: "Qubit created successfully",
        data: {
          qubit: {
            id: qubit.id,
            name: qubit.name,
            apiKey: qubit.apiKey,
          },
        },
      };
    } catch (error) {
      console.error("[QubitService] Error creating qubit:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to create qubit",
        error: error.message,
      };
    }
  }

  async list(userId) {
    console.log("[QubitService] Fetching user qubits", {
      userId,
    });

    try {
      const qubits = await Qubit.findAll({
        where: { userId },
        attributes: ["id", "name", "isActive", "createdAt"],
      });

      if (!qubits || qubits.length === 0) {
        console.log("[QubitService] No qubits found", {
          userId,
        });
        return {
          success: true,
          message: "No qubits found for user",
          data: { qubits: [] },
        };
      }

      console.log("[QubitService] Qubits retrieved successfully", {
        userId,
        qubitsCount: qubits.length,
      });

      return {
        success: true,
        message: "Qubits retrieved successfully",
        data: { qubits },
      };
    } catch (error) {
      console.error("[QubitService] Error fetching user qubits:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to retrieve user qubits",
      };
    }
  }
}

module.exports = QubitService;
