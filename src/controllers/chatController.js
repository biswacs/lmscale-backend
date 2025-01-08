const ChatService = require("../services/chatService");
const chatService = new ChatService();

const ChatController = {
  async chat(req, res) {
    const { message, conversation = [] } = req.body;
    const { qubitId } = req;

    console.log("[ChatController] Received chat request", {
      qubitId,
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
      console.log("[ChatController] Fetching qubit details", { qubitId });
      const qubitResult = await chatService.getQubit(qubitId);

      if (!qubitResult.success) {
        console.log("[ChatController] Failed to fetch qubit details", {
          qubitId,
          error: qubitResult.message,
        });
        throw new Error(qubitResult.message);
      }

      const qubit = qubitResult.data;
      console.log("[ChatController] Qubit details retrieved", {
        name: qubit.name,
        hasInstructions: qubit.instructions?.length > 0,
        instructionsCount: qubit.instructions?.length,
        hasFunctions: qubit.functions?.length > 0,
        functionsCount: qubit.functions?.length,
      });

      const formattedConversation = conversation
        .map(
          (msg) => `${msg.role === "user" ? "User" : "Qubit"}: ${msg.content}`
        )
        .join("\n");

      const prompt = `${qubit.prompt}\n\n${
        qubit.instructions.length > 0
          ? qubit.instructions.map((inst) => inst.content).join("\n\n")
          : ""
      }\n\n${formattedConversation}\nUser: ${message}\nQubit:`;

      console.log("[ChatController] Constructed prompt", {
        promptLength: prompt.length,
        hasInstructionsInPrompt: qubit.instructions.length > 0,
      });

      let aiResponse = "";

      await chatService.processChat(
        prompt,
        qubit.functions,
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
                qubitId,
              });

              await chatService.recordUsage({
                qubitId,
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
