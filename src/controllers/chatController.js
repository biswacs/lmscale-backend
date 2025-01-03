const axios = require("axios");
const ChatService = require("../services/chatService");
const ConversationService = require("../services/conversationService");
const { Conversation, Agent } = require("../models");
const chatService = new ChatService();
const conversationService = new ConversationService();

const ChatController = {
  async chat(req, res) {
    console.log("[ChatController] Received chat request", {
      userId: req.user.id,
      agentId: req.body.agentId,
      conversationId: req.body.conversationId,
      message: req.body.message,
    });

    if (!req.body.message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    let pendingAiMessage = null;
    let aiResponse = "";
    let agent = null;

    try {
      let conversationId = req.body.conversationId;

      if (conversationId) {
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
          throw new Error("Conversation not found");
        }
        agent = await Agent.findByPk(conversation.agentId);
        if (!agent) {
          throw new Error("Agent not found");
        }
      } else {
        if (!req.body.agentId) {
          throw new Error("agentId is required for new conversation");
        }

        const agentResult = await chatService.getAgent(req.body.agentId);
        if (!agentResult.success) {
          throw new Error(agentResult.message);
        }
        agent = agentResult.data.agent;

        const conversationResult = await conversationService.createConversation(
          req.user.id,
          agent.id
        );

        if (!conversationResult.success) {
          throw new Error(
            `Failed to create conversation: ${conversationResult.message}`
          );
        }

        conversationId = conversationResult.data.conversation.id;

        res.write(
          `data: ${JSON.stringify({
            conversationId,
            isNewConversation: true,
          })}\n\n`
        );
      }

      const messageResult = await chatService.createMessage({
        conversationId,
        role: "user",
        text: req.body.message,
        status: "completed",
      });

      if (!messageResult.success) {
        throw new Error(`Failed to create message: ${messageResult.message}`);
      }

      const pendingResult = await chatService.createMessage({
        conversationId,
        role: "ai",
        text: "",
        status: "pending",
      });

      if (!pendingResult.success) {
        throw new Error(
          `Failed to create pending message: ${pendingResult.message}`
        );
      }

      pendingAiMessage = pendingResult.data.message;

      const gpu = await chatService.getGpu();
      if (!gpu.success) {
        throw new Error(gpu.message);
      }

      try {
        await axios.get(`http://${gpu.data.hostIp}:8000/health`, {
          timeout: 5000,
        });
      } catch (error) {
        throw new Error(`GPU health check failed: ${error.message}`);
      }

      const messagesResult = await chatService.getConversationMessages(
        conversationId
      );
      if (!messagesResult.success) {
        throw new Error(
          `Failed to get conversation messages: ${messagesResult.message}`
        );
      }

      const formattedMessages = [
        ...new Set(
          messagesResult.data.messages.map(
            (msg) => `${msg.role === "user" ? "User" : "Agent"}: ${msg.content}`
          )
        ),
      ].join("\n");

      console.log(
        "[ChatController] Formatted conversation:",
        formattedMessages
      );

      const prompt = `${agent.prompt}\n\n${formattedMessages}\nUser: ${req.body.message}\nAgent:`;

      console.log("[ChatController] Final prompt:", prompt);

      const gpuResponse = await axios({
        method: "post",
        url: `http://${gpu.data.hostIp}:8000/chat/stream`,
        data: {
          message: prompt,
          context: [],
        },
        responseType: "stream",
        timeout: 30000,
      });

      gpuResponse.data.on("data", (chunk) => {
        try {
          const text = chunk.toString();
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            try {
              const cleanedLine = line.replace(/^data:\s*/, "").trim();
              if (!cleanedLine) continue;

              const data = JSON.parse(cleanedLine);

              if (data && typeof data === "object") {
                if (data.response) {
                  aiResponse += data.response;
                  res.write(
                    `data: ${JSON.stringify({ response: data.response })}\n\n`
                  );
                } else if (data.error) {
                  console.error("[ChatController] GPU Error:", data.error);
                  throw new Error(data.error);
                }
              }
            } catch (parseError) {
              console.error("[ChatController] Line parse error:", {
                line: line.slice(0, 100) + "...",
                error: parseError.message,
              });
            }
          }
        } catch (error) {
          console.error("[ChatController] Stream processing error:", error);
          handleError(error);
        }
      });

      gpuResponse.data.on("end", async () => {
        try {
          if (aiResponse && pendingAiMessage) {
            await chatService.updateMessage(pendingAiMessage.id, {
              text: aiResponse,
              status: "completed",
            });

            await chatService.recordUsage({
              agentId: agent.id,
              type: agent.type,
              input: req.body.message,
              output: aiResponse,
            });
          }

          if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
          }
        } catch (error) {
          console.error("[ChatController] Stream end error:", error);
          handleError(error);
        }
      });

      gpuResponse.data.on("error", (error) => {
        console.error("[ChatController] Stream error:", error);
        handleError(error);
      });
    } catch (error) {
      handleError(error);
    }

    function handleError(error) {
      console.error("[ChatController] Error:", {
        message: error.message,
        stack: error.stack,
      });

      if (pendingAiMessage) {
        chatService
          .updateMessage(pendingAiMessage.id, {
            status: "error",
            metadata: {
              error: error.message,
              errorType: error.name,
            },
          })
          .catch(console.error);
      }

      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            error: error.message || "Request failed",
            done: true,
          })}\n\n`
        );
        res.end();
      }
    }
  },
};

module.exports = ChatController;
