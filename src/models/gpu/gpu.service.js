const jwt = require("jsonwebtoken");
const { Gpu, sequelize } = require("../models");

class GpuService {
  generateGpuToken(gpuId) {
    console.log("[GpuService] Generating GPU access token", {
      gpuId,
    });

    if (!process.env.GPU_JWT_SECRET) {
      console.error(
        "[GpuService] GPU_JWT_SECRET missing in environment configuration"
      );
      throw new Error("GPU_JWT_SECRET is not configured");
    }

    return jwt.sign({ gpuId: gpuId }, process.env.GPU_JWT_SECRET);
  }

  async create(body, userEmail) {
    console.log("[GpuService] Attempting to create GPU", {
      userEmail,
      gpuDetails: {
        name: body.name,
        hostIp: body.hostIp,
        region: body.region,
      },
    });

    const transaction = await sequelize.transaction();

    try {
      if (!process.env.DevEm) {
        console.error(
          "[GpuService] DevEm missing in environment configuration"
        );
        throw new Error("DevEm is not configured");
      }

      if (userEmail !== process.env.DevEm) {
        console.log("[GpuService] Creation failed - unauthorized user", {
          userEmail,
        });
        return {
          success: false,
          message: "Unauthorized user for this request",
        };
      }

      const gpu = await Gpu.create(
        {
          name: body.name,
          hostIp: body.hostIp,
          hostUrl: body.hostUrl,
          region: body.region,
        },
        {
          transaction,
        }
      );

      console.log("[GpuService] GPU created successfully", {
        gpuId: gpu.id,
        name: gpu.name,
      });

      const gpuAccessToken = this.generateGpuToken(gpu.id);
      gpu.gpuAccessToken = gpuAccessToken;

      await gpu.save({ transaction });
      await transaction.commit();

      console.log("[GpuService] GPU access token generated and saved", {
        gpuId: gpu.id,
      });

      return {
        success: true,
        message: "GPU created successfully",
        data: {
          gpu: {
            id: gpu.id,
            name: gpu.name,
          },
        },
      };
    } catch (error) {
      console.error("[GpuService] Error creating GPU:", {
        userEmail,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();

      return {
        success: false,
        message: "Failed to create GPU",
        error: error.message,
      };
    }
  }
}

module.exports = GpuService;
