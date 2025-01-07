const ChatService = require("../services/chatService");
const chatService = new ChatService();

const ChatController = {
  async chat(req, res) {
    const { message, conversation = [] } = req.body;
    const { agentId } = req;

    console.log("[ChatController] Received chat request", {
      agentId,
      messageLength: message?.length,
      hasConversation: conversation.length > 0,
    });

    if (!message) {
      console.log("[ChatController] Message missing in request");
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    console.log("[ChatController] Chat conversation", {
      conversationLength: conversation.length,
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    try {
      console.log("[ChatController] Fetching agent details", { agentId });
      const agentResult = await chatService.getAgent(agentId);

      if (!agentResult.success) {
        console.log("[ChatController] Failed to fetch agent details", {
          agentId,
          error: agentResult.message,
        });
        throw new Error(agentResult.message);
      }

      const agent = agentResult.data;
      console.log("[ChatController] Agent details retrieved", {
        name: agent.name,
        hasInstructions: agent.instructions?.length > 0,
        instructionsCount: agent.instructions?.length,
        hasFunctions: agent.functions?.length > 0,
        functionsCount: agent.functions?.length,
      });

      const formattedConversation = conversation
        .map(
          (msg) => `${msg.role === "user" ? "User" : "Agent"}: ${msg.content}`
        )
        .join("\n");

      const prompt = `${agent.prompt}\n\n${
        agent.instructions.length > 0
          ? agent.instructions.map((inst) => inst.content).join("\n\n")
          : ""
      }\n\n${formattedConversation}\nUser: ${message}\nAgent:`;

      console.log("[ChatController] Constructed prompt", {
        promptLength: prompt.length,
        hasInstructionsInPrompt: agent.instructions.length > 0,
      });

      let aiResponse = "";

      await chatService.processChat(
        prompt,
        agent.functions,
        async (message) => {
          if (message.type === "response") {
            aiResponse += message.content;
            res.write(
              `data: ${JSON.stringify({ response: message.content })}\n\n`
            );
          } else if (message.type === "error") {
            if (!res.writableEnded) {
              res.write(
                `data: ${JSON.stringify({
                  error: message.content,
                  done: true,
                })}\n\n`
              );
              res.end();
            }
          } else if (message.type === "done") {
            if (message.content) {
              console.log("[ChatController] Stream completed successfully", {
                finalResponseLength: message.content.length,
                agentId,
              });

              await chatService.recordUsage({
                agentId,
                input: message,
                output: message.content,
              });
            }

            if (!res.writableEnded) {
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              res.end();
            }
          }
        }
      );
    } catch (error) {
      console.error("[ChatController] Request processing error:", {
        error: error.message,
        stack: error.stack,
      });

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
