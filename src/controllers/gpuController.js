const GpuService = require("../services/gpuService");
const gpuService = new GpuService();

const GpuController = {
  async create(req, res) {
    console.log("[GpuController] Received GPU creation request", {
      userId: req.user.id,
      gpuDetails: {
        name: req.body.name,
        hostIp: req.body.hostIp,
        region: req.body.region,
      },
    });

    try {
      const requiredFields = ["name", "hostIp", "hostUrl", "region"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[GpuController] Creation failed - missing required fields",
          {
            userId: req.user.id,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await gpuService.createGpu(req.body, req.user.id);

      if (!response.success) {
        console.log("[GpuController] GPU creation failed", {
          userId: req.user.id,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[GpuController] GPU created successfully", {
        userId: req.user.id,
        gpuId: response.data.gpu.id,
        gpuName: response.data.gpu.name,
      });

      return res.status(201).json({
        success: true,
        message: "GPU created successfully",
        data: {
          gpu: response.data.gpu,
        },
      });
    } catch (error) {
      console.error("[GpuController] GPU creation error:", {
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = GpuController;
