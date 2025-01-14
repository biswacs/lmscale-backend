const GpuService = require("../../models/gpu/gpu.service");
const gpuService = new GpuService();

const GpuController = {
  async createGpu(req, res) {
    console.log("[GpuController] Received GPU creation request", {
      userEmail: req.user.email,
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
            userEmail: req.user.email,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await gpuService.createGpu(req.body, req.user.email);

      if (!response.success) {
        console.log("[GpuController] GPU creation failed", {
          userEmail: req.user.email,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[GpuController] GPU created successfully", {
        userEmail: req.user.email,
        gpu: response.data.gpu,
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
        userEmail: req.user.email,
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
