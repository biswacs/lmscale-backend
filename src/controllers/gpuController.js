const GpuService = require("../services/gpuService");
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

      const result = await gpuService.create(req.body, req.user.email);

      if (!result.success) {
        console.log("[GpuController] GPU creation failed", {
          userEmail: req.user.email,
          reason: result.message,
        });
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      console.log("[GpuController] GPU created successfully", {
        userEmail: req.user.email,
        gpu: result.data.gpu,
      });

      return res.status(201).json({
        success: true,
        message: "GPU created successfully",
        data: {
          gpu: result.data.gpu,
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
