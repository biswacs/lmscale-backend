const ChatService = require("../services/chatService");
const chatService = new ChatService();

const ChatController = {
  async chat(req, res) {
    console.log("[ChatController] Received chat request", {
      agentId: req.agentId,
      messageLength: req.body.message?.length,
      hasHistory: req.body.messageHistory?.length > 0,
    });

    if (!req.body.message) {
      console.log("[ChatController] Message missing in request");
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const history = req.body.messageHistory || [];
    console.log("[ChatController] Chat history", {
      historyLength: history.length,
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    try {
      console.log("[ChatController] Fetching agent details", {
        agentId: req.agentId,
      });
      const agentResult = await chatService.getAgent(req.agentId);

      if (!agentResult.success) {
        console.log("[ChatController] Failed to fetch agent details", {
          agentId: req.agentId,
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

      const formattedHistory = history
        .map(
          (msg) => `${msg.role === "user" ? "User" : "Agent"}: ${msg.content}`
        )
        .join("\n");

      const prompt = `${agent.prompt}\n\n${
        agent.instructions.length > 0
          ? agent.instructions.map((inst) => inst.content).join("\n\n")
          : ""
      }\n\n${formattedHistory}\nUser: ${req.body.message}\nAgent:`;

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
                agentId: req.agentId,
              });

              await chatService.recordUsage({
                agentId: req.agentId,
                input: req.body.message,
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
