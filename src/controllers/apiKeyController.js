const ApiKeyService = require("../services/apiKeyService");
const apiKeyService = new ApiKeyService();

const ApiKeyController = {
  async getApiKey(req, res) {
    const userId = req.user.id;
    const assistantId = req.query.assistantId;

    console.log("[ApiKeyController] Received API key fetch request", {
      userId,
      assistantId,
    });

    try {
      if (!assistantId) {
        console.log("[ApiKeyController] Missing assistant ID", {
          userId,
        });
        return res.status(400).json({
          success: false,
          message: "Missing required parameter: assistantId",
        });
      }

      const response = await apiKeyService.get(userId, assistantId);

      if (!response.success) {
        console.log("[ApiKeyController] API key fetch failed", {
          userId,
          assistantId,
          reason: response.message,
        });
        return res.status(404).json({
          success: false,
          message: response.message,
        });
      }

      console.log("[ApiKeyController] API key fetched successfully", {
        userId,
        assistantId,
      });

      return res.status(200).json({
        success: true,
        message: "API key retrieved successfully",
        data: response.data,
      });
    } catch (error) {
      console.error("[ApiKeyController] API key fetch error:", {
        userId,
        assistantId,
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
