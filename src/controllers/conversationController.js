const ConversationService = require("../services/conversationService");
const conversationService = new ConversationService();

const ConversationController = {
  async listConversations(req, res) {
    console.log("[ConversationController] Listing conversations", {
      userId: req.user.id,
      agentId: req.query.agentId,
    });

    try {
      if (!req.query.agentId) {
        return res.status(400).json({
          success: false,
          message: "agentId is required",
        });
      }

      const result = await conversationService.listConversations(
        req.user.id,
        req.query.agentId
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error(
        "[ConversationController] Error listing conversations:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to list conversations",
      });
    }
  },

  async getConversationMessages(req, res) {
    console.log("[ConversationController] Getting conversation messages", {
      conversationId: req.params.conversationId,
    });

    try {
      const result = await conversationService.getConversationMessages(
        req.params.conversationId
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error(
        "[ConversationController] Error getting conversation messages:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to get conversation messages",
      });
    }
  },
};

module.exports = ConversationController;
