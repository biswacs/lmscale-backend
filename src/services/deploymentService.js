const { Deployment, sequelize } = require("../models");

class DeploymentService {
  async createDeployment(body, userId) {
    console.log("[DeploymentService] Attempting to create deployment", {
      userId,
      deploymentDetails: {
        name: body.name,
        description: body.description,
      },
    });

    try {
      const deployment = await Deployment.create({
        name: body.name,
        description: body.description,
        userId: userId,
      });

      console.log("[DeploymentService] Deployment created successfully", {
        deploymentId: deployment.id,
        name: deployment.name,
      });

      return {
        success: true,
        message: "Deployment created successfully",
        data: {
          deployment: {
            id: deployment.id,
            name: deployment.name,
          },
        },
      };
    } catch (error) {
      console.error("[DeploymentService] Error creating deployment:", {
        userId,
        error: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: "Failed to create deployment",
        error: error.message,
      };
    }
  }

  async setPrompt(body, userId) {
    console.log("[DeploymentService] Attempting to set prompt", {
      userId,
      deploymentId: body.deploymentId,
    });

    const transaction = await sequelize.transaction();

    try {
      const deployment = await Deployment.findOne({
        where: {
          id: body.deploymentId,
          userId: userId,
        },
        transaction,
      });

      if (!deployment) {
        console.log("[DeploymentService] No deployment found", {
          deploymentId: body.deploymentId,
          userId,
        });
        await transaction.rollback();
        return {
          success: false,
          message: "Deployment not found or unauthorized access",
        };
      }

      deployment.prompt = body.prompt;
      await deployment.save({ transaction });
      await transaction.commit();

      console.log("[DeploymentService] Prompt updated successfully", {
        deploymentId: deployment.id,
        userId,
      });

      return {
        success: true,
        message: "Prompt updated successfully",
        data: {
          deployment: {
            id: deployment.id,
            name: deployment.name,
            prompt: deployment.prompt,
          },
        },
      };
    } catch (error) {
      console.error("[DeploymentService] Error updating prompt:", {
        userId,
        deploymentId: body.deploymentId,
        error: error.message,
        stack: error.stack,
      });

      await transaction.rollback();

      return {
        success: false,
        message: "Failed to update prompt",
        error: error.message,
      };
    }
  }
}

module.exports = DeploymentService;
