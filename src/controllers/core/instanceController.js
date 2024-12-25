const InstanceService = require("../../services/core/instanceService");
const instanceService = new InstanceService();

const InstanceController = {
  async launchInstance(req, res) {
    try {
      const { imageId, instanceType, sshKey, volumeSize } = req.body;
      const result = await instanceService.createInstance({
        imageId,
        instanceType,
        sshKey,
        volumeSize,
      });

      if (!result.success) {
        return res
          .status(500)
          .json({ message: "Failed to launch EC2 instance" });
      }

      res.status(201).json({
        message: "GPU instance launched successfully",
        instanceId: result.instanceId,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = InstanceController;
