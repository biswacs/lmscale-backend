const axios = require("axios");

const PlaygroundController = {
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
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      gpuResponse.data.on("data", (chunk) => {
        res.write(chunk);
      });

      gpuResponse.data.on("end", () => {
        res.end();
      });

      gpuResponse.data.on("error", (error) => {
        res.write(
          `data: ${JSON.stringify({ error: "Stream error", done: true })}\n\n`
        );
        res.end();
      });
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({ error: "Request failed", done: true })}\n\n`
      );
      res.end();
    }
  },
};

module.exports = PlaygroundController;
