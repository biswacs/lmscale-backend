const axios = require("axios");

const DeploymentController = {
  async chat(req, res) {
    const GPU_SERVER = "http://13.232.229.112:8000";

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    try {
      const gpuResponse = await axios.post(
        `${GPU_SERVER}/chat/stream`,
        req.body,
        {
          responseType: "stream",
          timeout: 10000,
        }
      );

      gpuResponse.data.pipe(res);

      gpuResponse.data.on("end", () => {
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        }
      });
    } catch (error) {
      console.error("Error streaming from GPU server:", error);

      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({ error: "Request failed", done: true })}\n\n`
        );
        res.end();
      }
    }
  },
};

module.exports = DeploymentController;
