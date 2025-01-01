const DeploymentService = require("../services/deploymentService");
const deploymentService = new DeploymentService();

const DeploymentController = {
  async create(req, res) {
    console.log("[DeploymentController] Received deployment creation request", {
      userId: req.user.id,
      deploymentDetails: {
        name: req.body.name,
        description: req.body.description,
      },
    });

    try {
      const requiredFields = ["name", "description"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[DeploymentController] Creation failed - missing required fields",
          {
            userId: req.user.id,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await deploymentService.createDeployment(
        req.body,
        req.user.id
      );

      if (!response.success) {
        console.log("[DeploymentController] Deployment creation failed", {
          userId: req.user.id,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[DeploymentController] Deployment created successfully", {
        userId: req.user.id,
        deployment: response.data.deployment,
      });

      return res.status(201).json({
        success: true,
        message: "Deployment created successfully",
        data: {
          deployment: response.data.deployment,
        },
      });
    } catch (error) {
      console.error("[DeploymentController] Deployment creation error:", {
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  async setPrompt(req, res) {
    console.log("[DeploymentController] Received set prompt request", {
      userId: req.user.id,
      deploymentId: req.body.deploymentId,
    });

    try {
      const requiredFields = ["deploymentId", "prompt"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log(
          "[DeploymentController] Set prompt failed - missing required fields",
          {
            userId: req.user.id,
            missingFields,
          }
        );
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const response = await deploymentService.setPrompt(req.body, req.user.id);

      if (!response.success) {
        console.log("[DeploymentController] Set prompt failed", {
          userId: req.user.id,
          deploymentId: req.body.deploymentId,
          reason: response.message,
        });
        return res.status(400).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[DeploymentController] Prompt set successfully", {
        userId: req.user.id,
        deployment: response.data.deployment,
      });

      return res.status(200).json({
        success: true,
        message: "Prompt updated successfully",
        data: {
          deployment: response.data.deployment,
        },
      });
    } catch (error) {
      console.error("[DeploymentController] Set prompt error:", {
        userId: req.user.id,
        deploymentId: req.body.deploymentId,
        error: error.message,
        stack: error.stack,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = DeploymentController;
