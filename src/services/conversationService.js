const { Conversation, Message, Agent, sequelize } = require("../models");
const { Op } = require("sequelize");

class ConversationService {
  async createConversation(userId, agentId) {
    console.log("[ConversationService] Creating conversation", {
      userId,
      agentId,
    });

    try {
      const agent = await Agent.findOne({
        where: {
          id: agentId,
          isActive: true,
        },
      });

      if (!agent) {
        return {
          success: false,
          message: "Agent not found or inactive",
        };
      }

      const conversation = await Conversation.create({
        agentId: agent.id,
        lastMessageAt: new Date(),
      });

      return {
        success: true,
        data: {
          conversation,
          agent,
        },
      };
    } catch (error) {
      console.error(
        "[ConversationService] Error creating conversation:",
        error
      );
      return {
        success: false,
        message: "Failed to create conversation",
      };
    }
  }

  async listConversations(userId, agentId) {
    console.log("[ConversationService] Listing conversations", {
      userId,
      agentId,
    });

    try {
      const conversations = await Conversation.findAll({
        where: {
          agentId,
        },
        attributes: ["id", "title", "lastMessageAt"],
        order: [["lastMessageAt", "DESC"]],
      });

      return {
        success: true,
        data: {
          conversations,
        },
      };
    } catch (error) {
      console.error(
        "[ConversationService] Error listing conversations:",
        error
      );
      return {
        success: false,
        message: "Failed to list conversations",
      };
    }
  }

  async getConversationMessages(conversationId) {
    console.log("[ConversationService] Getting conversation messages", {
      conversationId,
    });

    try {
      const conversation = await Conversation.findByPk(conversationId, {
        include: [
          {
            model: Agent,
            as: "agent",
            attributes: ["id", "name", "type"],
          },
        ],
      });

      if (!conversation) {
        return {
          success: false,
          message: "Conversation not found",
        };
      }

      const messages = await Message.findAll({
        where: {
          conversationId,
          status: "completed",
          role: {
            [Op.ne]: "system",
          },
        },
        order: [["createdAt", "ASC"]],
        attributes: ["id", "role", ["text", "content"], "createdAt"],
      });

      return {
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            title: conversation.title,
            agent: conversation.agent,
          },
          messages,
        },
      };
    } catch (error) {
      console.error(
        "[ConversationService] Error getting conversation messages:",
        error
      );
      return {
        success: false,
        message: "Failed to get conversation messages",
      };
    }
  }

  async updateTitle(conversationId, title) {
    console.log("[ConversationService] Updating conversation title", {
      conversationId,
      title,
    });

    try {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return {
          success: false,
          message: "Conversation not found",
        };
      }

      await conversation.update({
        title,
        lastMessageAt: new Date(),
      });

      return {
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            title: conversation.title,
          },
        },
      };
    } catch (error) {
      console.error("[ConversationService] Error updating title:", error);
      return {
        success: false,
        message: "Failed to update conversation title",
      };
    }
  }
}

module.exports = ConversationService;
