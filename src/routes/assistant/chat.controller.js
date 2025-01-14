const ChatService = require("../../models/assistant/chat.service");
const chatService = new ChatService();

const ChatController = {
  async chat(req, res) {
    const { message, conversation = [] } = req.body;
    const { assistantId } = req;

    console.log("[ChatController] Received chat request", {
      assistantId,
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
      console.log("[ChatController] Fetching assistant details", {
        assistantId,
      });
      const assistantResult = await chatService.getAssistant(assistantId);

      if (!assistantResult.success) {
        console.log("[ChatController] Failed to fetch assistant details", {
          assistantId,
          error: assistantResult.message,
        });
        throw new Error(assistantResult.message);
      }

      const assistant = assistantResult.data;
      console.log("[ChatController] Assistant details retrieved", {
        name: assistant.name,
        hasInstructions: assistant.instructions?.length > 0,
        instructionsCount: assistant.instructions?.length,
        hasFunctions: assistant.functions?.length > 0,
        functionsCount: assistant.functions?.length,
      });

      const formattedConversation = conversation
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const prompt = `${assistant.prompt}\n\n${
        assistant.instructions.length > 0
          ? assistant.instructions.map((inst) => inst.content).join("\n\n")
          : ""
      }\n\n${formattedConversation}\nUser: ${message}\nAssistant:`;

      console.log("[ChatController] Constructed prompt", {
        promptLength: prompt.length,
        hasInstructionsInPrompt: assistant.instructions.length > 0,
      });

      let aiResponse = "";

      await chatService.processChat(
        prompt,
        assistant.functions,
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
                assistantId,
              });

              await chatService.recordUsage({
                assistantId,
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
