const axios = require("axios");
const ChatService = require("../services/chatService");
const chatService = new ChatService();

const ChatController = {
  async chat(req, res) {
    console.log("[ChatController] Received chat request");

    if (!req.body.message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const history = req.body.history || [];

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    let aiResponse = "";

    try {
      console.log("[ChatController] Getting agent details");
      const agentResult = await chatService.getAgentDetails(req.agentId);
      console.log("[ChatController] Agent details result:", agentResult);

      if (!agentResult.success) {
        throw new Error(agentResult.message);
      }

      const agent = agentResult.data;
      console.log("[ChatController] Agent data received:", {
        name: agent.name,
        hasInstructions: agent.instructions?.length > 0,
        hasFunctions: agent.functions?.length > 0,
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

      const gpuResponse = await axios({
        method: "post",
        url: `http://${gpu.data.hostIp}:8000/chat/stream`,
        data: {
          message: prompt,
          functions: agent.functions,
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
                throw new Error(data.error);
              }
            }
          }
        } catch (error) {
          console.error("[ChatController] Stream processing error:", error);
          handleError(error);
        }
      });

      gpuResponse.data.on("end", async () => {
        try {
          if (aiResponse) {
            await chatService.recordUsage({
              agentId: req.agentId,
              input: req.body.message,
              output: aiResponse,
            });
          }

          if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
          }
        } catch (error) {
          console.error("[ChatController] End handler error:", error);
          handleError(error);
        }
      });

      gpuResponse.data.on("error", handleError);
    } catch (error) {
      handleError(error);
    }

    function handleError(error) {
      console.error("[ChatController] Error:", error);

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
