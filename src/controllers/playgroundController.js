const axios = require("axios");
const stream = require("stream");
const { pipeline } = require("stream/promises");

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
      const gpuResponse = await axios({
        method: "post",
        url: `${GPU_SERVER}/chat/stream`,
        data: req.body,
        responseType: "stream",
      });

      const transformStream = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(chunk);
          callback();
        },
      });

      await pipeline(gpuResponse.data, transformStream, res);
    } catch (error) {
      const errorMessage = `data: ${JSON.stringify({
        error: "Request failed",
        done: true,
      })}\n\n`;

      res.write(errorMessage);
      res.end();
    }
  },
};

module.exports = PlaygroundController;
