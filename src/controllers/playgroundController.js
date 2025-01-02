const axios = require("axios");
const PlaygroundService = require("../services/playgroundService");
const playgroundService = new PlaygroundService();

const PlaygroundController = {
  async createConversation(req, res) {
    console.log("[PlaygroundController] Creating new conversation", {
      userId: req.user.id,
    });

    try {
      const conversation = await playgroundService.createConversation(
        req.user.id
      );

      if (!conversation.success) {
        return res.status(400).json({
          success: false,
          message: conversation.message,
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          conversation: conversation.data.conversation,
        },
      });
    } catch (error) {
      console.error(
        "[PlaygroundController] Error creating conversation:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to create conversation",
      });
    }
  },

  async listConversations(req, res) {
    console.log("[PlaygroundController] Listing conversations", {
      userId: req.user.id,
      query: req.query,
    });

    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const conversations = await playgroundService.listConversations(
        req.user.id,
        options
      );

      if (!conversations.success) {
        return res.status(400).json({
          success: false,
          message: conversations.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: conversations.data,
      });
    } catch (error) {
      console.error(
        "[PlaygroundController] Error listing conversations:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to list conversations",
      });
    }
  },

  async chat(req, res) {
    console.log("[PlaygroundController] Received chat request", {
      userId: req.user.id,
      conversationId: req.body.conversationId,
      query: req.body.query,
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    let pendingAiMessage = null;
    let aiResponse = "";

    try {
      const userMessageResult = await playgroundService.createMessage({
        conversationId: req.body.conversationId,
        role: "user",
        text: req.body.query,
        status: "completed",
      });

      if (!userMessageResult.success) {
        throw new Error(
          `Failed to create user message: ${userMessageResult.message}`
        );
      }

      const pendingMessageResult = await playgroundService.createMessage({
        conversationId: req.body.conversationId,
        role: "ai",
        text: "",
        status: "pending",
      });

      if (!pendingMessageResult.success) {
        throw new Error(
          `Failed to create pending AI message: ${pendingMessageResult.message}`
        );
      }

      pendingAiMessage = pendingMessageResult.data.message;

      const gpu = await playgroundService.getGpu();
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

      const messagesResult = await playgroundService.getConversationHistory(
        req.body.conversationId
      );
      if (!messagesResult.success) {
        throw new Error(
          `Failed to get conversation history: ${messagesResult.message}`
        );
      }

      const formattedMessages = messagesResult.data.messages
        .map(
          (msg) => `${msg.role === "user" ? "User" : "Agent"}: ${msg.content}`
        )
        .join("\n");

      console.log(
        "[PlaygroundController] Formatted conversation:",
        formattedMessages
      );

      const agentResult = await playgroundService.getPlaygroundAgent(
        req.user.id
      );
      if (!agentResult.success) {
        throw new Error(`Failed to get agent: ${agentResult.message}`);
      }

      const prompt = `${agentResult.data.agent.prompt}\n\n${formattedMessages}\nUser: ${req.body.query}\nAgent:`;

      console.log("[PlaygroundController] Final prompt:", prompt);

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
          const lines = chunk.toString().split("\n");
          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line.replace("data: ", ""));
                if (data.response) {
                  aiResponse += data.response;
                  res.write(
                    `data: ${JSON.stringify({ response: data.response })}\n\n`
                  );
                }
              } catch (parseError) {
                console.error(
                  "[PlaygroundController] Parse error:",
                  parseError
                );
              }
            }
          }
        } catch (error) {
          console.error(
            "[PlaygroundController] Stream processing error:",
            error
          );
        }
      });

      gpuResponse.data.on("end", async () => {
        try {
          if (aiResponse && pendingAiMessage) {
            const updateResult = await playgroundService.updateMessage(
              pendingAiMessage.id,
              {
                text: aiResponse,
                status: "completed",
              }
            );

            if (!updateResult.success) {
              throw new Error(
                `Failed to update AI message: ${updateResult.message}`
              );
            }

            await playgroundService.recordUsage({
              agentId: agentResult.data.agent.id,
              type: "playground",
              input: req.body.query,
              output: aiResponse,
            });
          }

          if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
          }
        } catch (error) {
          console.error("[PlaygroundController] End handler error:", error);
          handleError(error);
        }
      });

      gpuResponse.data.on("error", (error) => {
        console.error("[PlaygroundController] Stream error:", error);
        handleError(error);
      });
    } catch (error) {
      handleError(error);
    }

    function handleError(error) {
      console.error("[PlaygroundController] Error:", {
        message: error.message,
        stack: error.stack,
      });

      if (pendingAiMessage) {
        playgroundService
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

module.exports = PlaygroundController;
