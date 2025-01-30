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

  async processChat(prompt, functions = [], messageCallback) {
    console.log("[ChatService] Starting OpenAI chat processing");

    try {
      const messages = [{ role: "system", content: prompt }];

      const completionConfig = {
        model: "gpt-4-0125-preview",
        messages,
        stream: true,
      };

      if (functions && functions.length > 0) {
        console.log("[ChatService] Preparing function definitions");
        const formattedFunctions = functions.map((fn) => {
          console.log(`[ChatService] Formatting function: ${fn.name}`);
          return {
            name: fn.name,
            description:
              fn.description || "Function to retrieve GitHub user data",
            parameters: {
              type: "object",
              properties: {
                ...Object.entries(fn.parameters.query || {}).reduce(
                  (acc, [key, value]) => ({
                    ...acc,
                    [key]: {
                      type: value.type || "string",
                      description: value.description || `The GitHub ${key}`,
                      ...(value.enum ? { enum: value.enum } : {}),
                    },
                  }),
                  {}
                ),
              },
              required: Object.entries(fn.parameters.query || {})
                .filter(([_, value]) => value.required)
                .map(([key, _]) => key),
            },
          };
        });

        completionConfig.functions = formattedFunctions;
        completionConfig.function_call = "auto";
      }

      const stream = await openai.chat.completions.create(completionConfig);

      let aiResponse = "";
      let currentFunctionCall = null;
      let lastChunk = null;

      for await (const chunk of stream) {
        lastChunk = chunk;

        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          aiResponse += content;
          messageCallback({
            type: "response",
            content: content,
          });
        }

        if (chunk.choices[0]?.delta?.function_call) {
          const functionDelta = chunk.choices[0].delta.function_call;

          if (functionDelta.name) {
            currentFunctionCall = {
              name: functionDelta.name,
              arguments: "",
            };
            console.log(
              "[ChatService] Starting new function call:",
              functionDelta.name
            );
          }

          if (functionDelta.arguments) {
            currentFunctionCall.arguments += functionDelta.arguments;
          }
        }

        if (
          currentFunctionCall &&
          (chunk.choices[0]?.finish_reason === "function_call" ||
            lastChunk?.choices[0]?.finish_reason === "function_call")
        ) {
          try {
            const functionArgs = JSON.parse(currentFunctionCall.arguments);
            const matchedFunction = functions.find(
              (f) => f.name === currentFunctionCall.name
            );

            if (matchedFunction) {
              console.log(
                "[ChatService] Function matched:",
                matchedFunction.name
              );

              const headers = {};
              if (
                matchedFunction.authType === "bearer" &&
                matchedFunction.metadata?.token
              ) {
                headers[
                  "Authorization"
                ] = `Bearer ${matchedFunction.metadata.token}`;
              }

              if (
                matchedFunction.parameters.header &&
                Object.keys(matchedFunction.parameters.header).length > 0
              ) {
                Object.assign(headers, matchedFunction.parameters.header);
              }

              let url = matchedFunction.endpoint;
              if (
                matchedFunction.method.toUpperCase() === "GET" &&
                Object.keys(functionArgs).length > 0
              ) {
                const queryParams = new URLSearchParams(
                  functionArgs
                ).toString();
                url = `${url}${url.includes("?") ? "&" : "?"}${queryParams}`;
              }

              const functionResponse = await axios({
                method: matchedFunction.method,
                url: url,
                ...(matchedFunction.method.toUpperCase() !== "GET"
                  ? { data: functionArgs }
                  : {}),
                headers,
                validateStatus: false,
              });

              console.log(
                "[ChatService] API call completed with status:",
                functionResponse.status
              );

              messages.push(
                {
                  role: "assistant",
                  content: null,
                  function_call: {
                    name: currentFunctionCall.name,
                    arguments: currentFunctionCall.arguments,
                  },
                },
                {
                  role: "function",
                  name: currentFunctionCall.name,
                  content: JSON.stringify(functionResponse.data),
                }
              );

              const functionResponseCompletion =
                await openai.chat.completions.create({
                  model: "gpt-4-0125-preview",
                  messages,
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
            console.error("[ChatService] Function execution error:", {
              name: currentFunctionCall?.name,
              error: error.message,
              stack: error.stack,
            });
            messageCallback({
              type: "error",
              content: `I encountered an error while fetching your GitHub data: ${error.message}`,
            });
          }

          currentFunctionCall = null;
        }
      }

      console.log("[ChatService] Stream completed successfully");
      messageCallback({
        type: "done",
        content: aiResponse,
      });
    } catch (error) {
      console.error("[ChatService] Chat processing error:", {
        error: error.message,
        stack: error.stack,
      });
      messageCallback({
        type: "error",
        content: `I'm sorry, but I encountered an error: ${error.message}`,
      });
    }
  }
}

module.exports = ChatService;
