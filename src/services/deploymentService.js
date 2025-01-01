class DeploymentService {
  async createDeployment(body, userId) {
    const name = body.name;
    const description = body.description;
    console.log(name, description, userId);
  }
}

module.exports = DeploymentService;
