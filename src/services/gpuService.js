const jwt = require("jsonwebtoken");
const { User, Gpu, sequelize } = require("../models");

class GpuService {
  generateGpuAccessToken(gpuId) {
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

  async createGpu(body, userId) {
    console.log("[GpuService] Attempting to create GPU", {
      userId,
      gpuDetails: {
        name: body.name,
        hostIp: body.hostIp,
        region: body.region,
      },
    });

    const transaction = await sequelize.transaction();

    try {
      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "email"],
      });

      if (!user) {
        console.log("[GpuService] Creation failed - user not found", {
          userId,
        });
        return {
          success: false,
          message: "User not found",
        };
      }
      if (!process.env.DevEm) {
        console.error(
          "[GpuService] DevEm missing in environment configuration"
        );
        throw new Error("DevEm is not configured");
      }
      if (user.email !== process.env.DevEm) {
        console.log("[GpuService] Creation failed - unauthorized user", {
          userId,
          userEmail: user.email,
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

      const gpuAccessToken = this.generateGpuAccessToken(gpu.id);
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
          gpu,
          user,
        },
      };
    } catch (error) {
      console.error("[GpuService] Error creating GPU:", {
        userId,
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
