const axios = require("axios");
const ChatService = require("../services/chatService");
const chatService = new ChatService();

const ChatController = {
  async chat(req, res) {
    console.log("[ChatController] Received chat request", {
      agentId: req.agentId,
      messageLength: req.body.message?.length,
      hasHistory: req.body.history?.length > 0,
    });

    if (!req.body.message) {
      console.log("[ChatController] Message missing in request");
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const history = req.body.history || [];
    console.log("[ChatController] Chat history", {
      historyLength: history.length,
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    let aiResponse = "";

    try {
      console.log("[ChatController] Fetching agent details", {
        agentId: req.agentId,
      });
      const agentResult = await chatService.getAgentDetails(req.agentId);

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

      const gpu = await chatService.getGpu();
      if (!gpu.success) {
        console.log("[ChatController] GPU fetch failed", {
          error: gpu.message,
        });
        throw new Error(gpu.message);
      }

      console.log("[ChatController] GPU found, checking health", {
        hostIp: gpu.data.hostIp,
      });

      try {
        await axios.get(`http://${gpu.data.hostIp}:8000/health`, {
          timeout: 5000,
        });
        console.log("[ChatController] GPU health check passed");
      } catch (error) {
        console.error("[ChatController] GPU health check failed", {
          error: error.message,
          hostIp: gpu.data.hostIp,
        });
        throw new Error(`GPU health check failed: ${error.message}`);
      }

      console.log("[ChatController] Sending request to GPU");
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
                console.error("[ChatController] GPU returned error in stream", {
                  error: data.error,
                });
                throw new Error(data.error);
              }
            }
          }
        } catch (error) {
          console.error("[ChatController] Stream processing error:", {
            error: error.message,
            stack: error.stack,
          });
          handleError(error);
        }
      });

      gpuResponse.data.on("end", async () => {
        try {
          if (aiResponse) {
            console.log("[ChatController] Stream completed successfully", {
              finalResponseLength: aiResponse.length,
              agentId: req.agentId,
            });

            console.log("[ChatController] Recording usage");
            await chatService.recordUsage({
              agentId: req.agentId,
              input: req.body.message,
              output: aiResponse,
            });
          }

          if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            console.log(
              "[ChatController] Response completed and connection closed"
            );
          }
        } catch (error) {
          console.error("[ChatController] Error in stream end handler:", {
            error: error.message,
            stack: error.stack,
          });
          handleError(error);
        }
      });

      gpuResponse.data.on("error", (error) => {
        console.error("[ChatController] GPU stream error:", {
          error: error.message,
          stack: error.stack,
        });
        handleError(error);
      });
    } catch (error) {
      console.error("[ChatController] Request processing error:", {
        error: error.message,
        stack: error.stack,
      });
      handleError(error);
    }

    function handleError(error) {
      console.error("[ChatController] Error handler triggered:", {
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
        console.log(
          "[ChatController] Error response sent and connection closed"
        );
      }
    }
  },
};

module.exports = ChatController;
