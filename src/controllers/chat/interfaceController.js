const InstanceService = require("../../services/instanceService");
const instanceService = new InstanceService();

const InstanceController = {
  async getInstanceId(req, res) {
    try {
      // yahan param ya req.user krke token ajayega aur phir usko extract krenge phir isntance id dhundhenge
      const token = req.headers.authorization;
      const verifiedToken = instanceService.extractUserId(token);
      const instanceId = await instanceService.toFindInstance(verifiedToken);
      if (instanceId) {
        res.status(200).json({
          message: `You Instance Id is ${instanceId}`,
        });
      } else {
        res.status(500).json({
          message: "error",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("error retrieving instance id");
    }
  },
};

module.exports = InstanceController;
