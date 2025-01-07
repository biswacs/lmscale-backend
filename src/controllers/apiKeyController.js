const ApiKeyService = require("../services/apiKeyService");
const apiKeyService = new ApiKeyService();

const ApiKeyController = {
  async getApiKey(req, res) {
    const userId = req.user.id;
    const agentId = req.query.agentId;

    console.log("[ApiKeyController] Received API key fetch request", {
      userId,
      agentId,
    });

    try {
      if (!agentId) {
        console.log("[ApiKeyController] Missing agent ID", {
          userId,
        });
        return res.status(400).json({
          success: false,
          message: "Missing required parameter: agentId",
        });
      }

      const response = await apiKeyService.get(userId, agentId);

      if (!response.success) {
        console.log("[ApiKeyController] API key fetch failed", {
          userId,
          agentId,
          reason: response.message,
        });
        return res.status(404).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[ApiKeyController] API key fetched successfully", {
        userId,
        agentId,
      });

      return res.status(200).json({
        success: true,
        message: "API key retrieved successfully",
        data: response.data,
      });
    } catch (error) {
      console.error("[ApiKeyController] API key fetch error:", {
        userId,
        agentId,
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

module.exports = ApiKeyController;
