const jwt = require("jsonwebtoken");
const { User, Gpu, sequelize } = require("../models");

class GpuService {
  generateGpuAccessToken(gpuId) {
    return jwt.sign({ gpuId: gpuId }, process.env.JWT_SECRET);
  }
  async createGpu(body, userId) {
    console.log(body);
    const transaction = await sequelize.transaction();

    try {
      const user = await User.findOne({
        where: { id: userId },
        attributes: ["email"],
      });
      if (user.email !== "biswaasen@gmail.com") {
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
      const gpuAccessToken = this.generateGpuAccessToken(gpu.id);

      gpu.gpuAccessToken = gpuAccessToken;

      await gpu.save({ transaction });

      transaction.commit();

      return {
        success: true,
        message: "reached service layer",
        data: gpu,
        user: user,
      };
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  }
}

module.exports = GpuService;
