const GpuService = require("../services/gpuService");
const gpuService = new GpuService();

const GpuController = {
  async create(req, res) {
    console.log(req.body);
    console.log(
      "[GpuController] Received gpu creating request from",
      req.user.id
    );
    const response = await gpuService.createGpu(req.body, req.user.id);
    console.log(response);

    return res.json(response);
  },
};

module.exports = GpuController;
