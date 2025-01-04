const { Agent, Function, Instruction, Usage, Gpu } = require("../models");
const { calculateTokens } = require("../utils/tokenizer");

class ChatService {
  async getAgentDetails(agentId) {
    console.log("[ChatService] Fetching agent details", { agentId });

    try {
      const agent = await Agent.findOne({
        where: {
          id: agentId,
          isActive: true,
        },
        include: [
          {
            model: Instruction,
            as: "instructions",
            attributes: ["name", "content"],
            where: { isActive: true },
            required: false,
          },
          {
            model: Function,
            as: "functions",
            attributes: [
              "name",
              "endpoint",
              "method",
              "parameters",
              "authType",
            ],
            where: { isActive: true },
            required: false,
          },
        ],
        attributes: ["id", "name", "prompt"],
      });

      if (!agent) {
        console.log("[ChatService] Agent not found or inactive", { agentId });
        return {
          success: false,
          message: "Agent not found or inactive",
        };
      }

      const formattedData = {
        name: agent.name,
        prompt: agent.prompt,
        instructions: agent.instructions
          ? agent.instructions.map((inst) => ({
              name: inst.name,
              content: inst.content,
            }))
          : [],
        functions: agent.functions
          ? agent.functions.map((fn) => ({
              name: fn.name,
              endpoint: fn.endpoint,
              method: fn.method,
              parameters: fn.parameters,
              authType: fn.authType,
            }))
          : [],
      };

      console.log("[ChatService] Agent details retrieved successfully", {
        agentId,
        name: agent.name,
        instructionsCount: formattedData.instructions.length,
        functionsCount: formattedData.functions.length,
      });

      return {
        success: true,
        data: formattedData,
      };
    } catch (error) {
      console.error("[ChatService] Error finding agent:", {
        agentId,
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: "Failed to retrieve agent details",
      };
    }
  }

  async getGpu() {
    console.log("[ChatService] Looking for available GPU");

    try {
      const gpu = await Gpu.findOne({
        attributes: ["hostIp"],
        where: { status: "available" },
      });

      if (!gpu) {
        console.log("[ChatService] No available GPU found");
        return {
          success: false,
          message: "No GPU available",
        };
      }

      console.log("[ChatService] Available GPU found", {
        hostIp: gpu.hostIp,
      });

      return {
        success: true,
        data: {
          hostIp: gpu.hostIp,
        },
      };
    } catch (error) {
      console.error("[ChatService] Error finding GPU:", {
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: "Failed to retrieve GPU information",
      };
    }
  }

  async recordUsage({ agentId, input, output }) {
    console.log("[ChatService] Recording usage", { agentId });

    try {
      const inputTokens = calculateTokens(input);
      const outputTokens = calculateTokens(output);

      console.log("[ChatService] Calculated tokens", {
        agentId,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      });

      const usage = await Usage.getOrCreateDaily(agentId);
      await usage.incrementTokens(inputTokens, outputTokens);

      console.log("[ChatService] Usage recorded successfully", {
        agentId,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      });

      return {
        success: true,
        data: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      };
    } catch (error) {
      console.error("[ChatService] Error recording usage:", {
        agentId,
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: "Failed to record usage",
      };
    }
  }
}

module.exports = ChatService;
