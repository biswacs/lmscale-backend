const DeploymentService = require("../services/deploymentService");
const deploymentService = new DeploymentService();

const DeploymentController = {
  async create(req, res) {
    console.log(req.user.id);
    const response = await deploymentService.createDeployment(
      req.body,
      req.user.id
    );
    return res.json(response);
  },
};

module.exports = DeploymentController;
