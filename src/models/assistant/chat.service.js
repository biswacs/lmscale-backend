const { Assistant, Function, Instruction, Usage, Gpu } = require("../index");
const { calculateTokens } = require("../../utils/tokenizer");
const OpenAI = require("openai");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API,
});

class ChatService {
  async getAssistant(assistantId) {
    console.log("[ChatService] Fetching assistant details", { assistantId });

    try {
      const assistant = await Assistant.findOne({
        where: {
          id: assistantId,
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

      if (!assistant) {
        console.log("[ChatService] Assistant not found or inactive", {
          assistantId,
        });
        return {
          success: false,
          message: "Assistant not found or inactive",
        };
      }

      const formattedData = {
        name: assistant.name,
        prompt: assistant.prompt,
        instructions: assistant.instructions
          ? assistant.instructions.map((inst) => ({
              name: inst.name,
              content: inst.content,
            }))
          : [],
        functions: assistant.functions
          ? assistant.functions.map((fn) => ({
              name: fn.name,
              endpoint: fn.endpoint,
              method: fn.method,
              parameters: fn.parameters,
              authType: fn.authType,
            }))
          : [],
      };

      console.log("[ChatService] Assistant details retrieved successfully", {
        assistantId,
        name: assistant.name,
        instructionsCount: formattedData.instructions.length,
        functionsCount: formattedData.functions.length,
      });

      return {
        success: true,
        data: formattedData,
      };
    } catch (error) {
      console.error("[ChatService] Error finding assistant:", {
        assistantId,
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: "Failed to retrieve assistant details",
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

  async recordUsage({ assistantId, input, output }) {
    console.log("[ChatService] Recording usage", { assistantId });

    try {
      const inputTokens = calculateTokens(input);
      const outputTokens = calculateTokens(output);

      console.log("[ChatService] Calculated tokens", {
        assistantId,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      });

      const usage = await Usage.getOrCreateDaily(assistantId);
      await usage.incrementTokens(inputTokens, outputTokens);

      console.log("[ChatService] Usage recorded successfully", {
        assistantId,
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
        assistantId,
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
    console.log("[ChatService] Starting OpenAI chat processing");

    try {
      const messages = [{ role: "system", content: prompt }];

      const formattedFunctions = functions.map((fn) => ({
        name: fn.name,
        description: fn.description || "Function to call external API",
        parameters: fn.parameters,
      }));

      const stream = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: messages,
        functions:
          formattedFunctions.length > 0 ? formattedFunctions : undefined,
        function_call: formattedFunctions.length > 0 ? "auto" : undefined,
        stream: true,
      });

      let aiResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          aiResponse += content;
          messageCallback({
            type: "response",
            content: content,
          });
        }

        if (chunk.choices[0]?.delta?.function_call) {
          const functionCall = chunk.choices[0].delta.function_call;

          try {
            const functionName = functionCall.name;
            const functionArgs = JSON.parse(functionCall.arguments);
            const matchedFunction = functions.find(
              (f) => f.name === functionName
            );

            if (matchedFunction) {
              const functionResponse = await axios({
                method: matchedFunction.method || "get",
                url: matchedFunction.endpoint,
                data: functionArgs,
              });

              const functionResponseCompletion =
                await openai.chat.completions.create({
                  model: "gpt-4-0125-preview",
                  messages: [
                    ...messages,
                    {
                      role: "function",
                      name: functionName,
                      content: JSON.stringify(functionResponse.data),
                    },
                  ],
                  stream: true,
                });

              for await (const functionChunk of functionResponseCompletion) {
                const functionContent =
                  functionChunk.choices[0]?.delta?.content || "";
                if (functionContent) {
                  aiResponse += functionContent;
                  messageCallback({
                    type: "response",
                    content: functionContent,
                  });
                }
              }
            }
          } catch (error) {
            console.error("[ChatService] Function call error:", error);
            messageCallback({
              type: "error",
              content: error.message || "Function call failed",
            });
          }
        }
      }

      messageCallback({
        type: "done",
        content: aiResponse,
      });
    } catch (error) {
      console.error("[ChatService] OpenAI chat processing error:", {
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
