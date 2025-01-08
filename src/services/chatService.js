const { Qubit, Function, Instruction, Usage, Gpu } = require("../models");
const { calculateTokens } = require("../utils/tokenizer");
const axios = require("axios");

class ChatService {
  async getQubit(qubitId) {
    console.log("[ChatService] Fetching qubit details", { qubitId });

    try {
      const qubit = await Qubit.findOne({
        where: {
          id: qubitId,
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

      if (!qubit) {
        console.log("[ChatService] Qubit not found or inactive", { qubitId });
        return {
          success: false,
          message: "Qubit not found or inactive",
        };
      }

      const formattedData = {
        name: qubit.name,
        prompt: qubit.prompt,
        instructions: qubit.instructions
          ? qubit.instructions.map((inst) => ({
              name: inst.name,
              content: inst.content,
            }))
          : [],
        functions: qubit.functions
          ? qubit.functions.map((fn) => ({
              name: fn.name,
              endpoint: fn.endpoint,
              method: fn.method,
              parameters: fn.parameters,
              authType: fn.authType,
            }))
          : [],
      };

      console.log("[ChatService] Qubit details retrieved successfully", {
        qubitId,
        name: qubit.name,
        instructionsCount: formattedData.instructions.length,
        functionsCount: formattedData.functions.length,
      });

      return {
        success: true,
        data: formattedData,
      };
    } catch (error) {
      console.error("[ChatService] Error finding qubit:", {
        qubitId,
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: "Failed to retrieve qubit details",
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

  async recordUsage({ qubitId, input, output }) {
    console.log("[ChatService] Recording usage", { qubitId });

    try {
      const inputTokens = calculateTokens(input);
      const outputTokens = calculateTokens(output);

      console.log("[ChatService] Calculated tokens", {
        qubitId,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      });

      const usage = await Usage.getOrCreateDaily(qubitId);
      await usage.incrementTokens(inputTokens, outputTokens);

      console.log("[ChatService] Usage recorded successfully", {
        qubitId,
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
        qubitId,
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: "Failed to record usage",
      };
    }
  }

  async processChat(prompt, functions, messageCallback) {
    console.log("[ChatService] Starting GPU chat processing");

    try {
      const gpu = await this.getGpu();
      if (!gpu.success) {
        console.log("[ChatService] GPU fetch failed", {
          error: gpu.message,
        });
        throw new Error(gpu.message);
      }

      console.log("[ChatService] GPU found, checking health", {
        hostIp: gpu.data.hostIp,
      });

      try {
        await axios.get(`http://${gpu.data.hostIp}:8000/health`, {
          timeout: 5000,
        });
        console.log("[ChatService] GPU health check passed");
      } catch (error) {
        console.error("[ChatService] GPU health check failed", {
          error: error.message,
          hostIp: gpu.data.hostIp,
        });
        throw new Error(`GPU health check failed: ${error.message}`);
      }

      console.log("[ChatService] Sending request to GPU");
      const gpuResponse = await axios({
        method: "post",
        url: `http://${gpu.data.hostIp}:8000/chat/stream`,
        data: {
          message: prompt,
          functions: functions,
        },
        responseType: "stream",
        timeout: 30000,
      });

      let aiResponse = "";

      gpuResponse.data.on("data", (chunk) => {
        try {
          const text = chunk.toString();
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            const cleanedLine = line.replace(/^data:\s*/, "").trim();
            if (!cleanedLine) continue;

            const data = JSON.parse(cleanedLine);

            if (data && typeof data === "object") {
              if (data.response) {
                aiResponse += data.response;
                messageCallback({
                  type: "response",
                  content: data.response,
                });
              } else if (data.error) {
                console.error("[ChatService] GPU returned error in stream", {
                  error: data.error,
                });
                throw new Error(data.error);
              }
            }
          }
        } catch (error) {
          console.error("[ChatService] Stream processing error:", {
            error: error.message,
            stack: error.stack,
          });
          messageCallback({
            type: "error",
            content: error.message || "Stream processing failed",
          });
        }
      });

      gpuResponse.data.on("end", () => {
        console.log("[ChatService] Final AI response completed", {
          responseLength: aiResponse.length,
          firstChars: aiResponse,
        });

        messageCallback({
          type: "done",
          content: aiResponse,
        });
      });

      gpuResponse.data.on("error", (error) => {
        console.error("[ChatService] GPU stream error:", {
          error: error.message,
          stack: error.stack,
        });
        messageCallback({
          type: "error",
          content: error.message || "Stream error occurred",
        });
      });
    } catch (error) {
      console.error("[ChatService] GPU chat processing error:", {
        error: error.message,
        stack: error.stack,
      });
      messageCallback({
        type: "error",
        content: error.message || "Chat processing failed",
      });
    }
  }
}

module.exports = ChatService;
