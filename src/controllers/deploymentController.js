const DeploymentService = require("../services/deploymentService");
const deploymentService = new DeploymentService();

const DeploymentController = {
  async create(req, res) {
    console.log(req.user.id);
    const response = deploymentService.createDeployment(req.body, req.user.id);
    return res.json(req.body);
  },
};

module.exports = DeploymentController;
