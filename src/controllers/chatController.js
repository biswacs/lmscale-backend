const axios = require("axios");
const { Gpu } = require("../models");

const ChatController = {
  async completion(req, res) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    try {
      const gpu = await Gpu.findOne({
        attributes: ["hostIp"],
      });
      if (!gpu) {
        console.log("Gpu not found");
        res.write(
          `data: ${JSON.stringify({
            error: "GPU Error, Request failed",
            done: false,
          })}\n\n`
        );
        res.end();
      }
      const gpu_url = `http://${gpu.hostIp}:8000`;
      const gpuResponse = await axios.post(`${gpu_url}/chat/stream`, req.body, {
        responseType: "stream",
        timeout: 10000,
      });

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

module.exports = ChatController;
