const { Deployment } = require("../models");

class DeploymentService {
  async createDeployment(body, userId) {
    const name = body.name;
    const description = body.description;
    console.log(name, description, userId);

    const deployment = await Deployment.create({
      name: name,
      description: description,
      userId: userId,
    });
    return { success: true, deployment };
  }
}

module.exports = DeploymentService;
