const { Agent, Gpu, Conversation, Message, Usage } = require("../models");
const { calculateTokens } = require("../utils/tokenizer");
const { Op } = require("sequelize");

class PlaygroundService {
  async createConversation(userId) {
    console.log("[PlaygroundService] Creating new conversation", {
      userId,
    });

    try {
      const agent = await this.getPlaygroundAgent(userId);
      if (!agent.success) {
        return {
          success: false,
          message: "No playground agent available",
        };
      }

      const conversation = await Conversation.create({
        agentId: agent.data.agent.id,
        type: "playground",
        metadata: {
          createdBy: userId,
          lastMessageAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          conversation,
        },
      };
    } catch (error) {
      console.error("[PlaygroundService] Error creating conversation:", error);
      return {
        success: false,
        message: "Failed to create conversation",
      };
    }
  }

  async listConversations(userId, options = {}) {
    console.log("[PlaygroundService] Listing conversations", {
      userId,
      options,
    });

    try {
      const agent = await this.getPlaygroundAgent(userId);
      if (!agent.success) {
        return {
          success: false,
          message: "No playground agent available",
        };
      }

      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const conversations = await Conversation.findAndCountAll({
        where: {
          agentId: agent.data.agent.id,
          type: "playground",
        },
        order: [["updatedAt", "DESC"]],
        limit,
        offset,
      });

      return {
        success: true,
        data: {
          conversations: conversations.rows,
          pagination: {
            total: conversations.count,
            page,
            limit,
            pages: Math.ceil(conversations.count / limit),
          },
        },
      };
    } catch (error) {
      console.error("[PlaygroundService] Error listing conversations:", error);
      return {
        success: false,
        message: "Failed to list conversations",
      };
    }
  }

  async createMessage(messageData) {
    console.log("[PlaygroundService] Creating message", messageData);

    try {
      const tokens = await calculateTokens(messageData.text);
      const message = await Message.create({
        ...messageData,
        tokens,
      });

      await Conversation.update(
        {
          metadata: {
            lastMessageAt: new Date(),
          },
        },
        {
          where: {
            id: messageData.conversationId,
          },
        }
      );

      return {
        success: true,
        data: {
          message,
        },
      };
    } catch (error) {
      console.error("[PlaygroundService] Error creating message:", error);
      return {
        success: false,
        message: "Failed to create message",
      };
    }
  }

  async updateMessage(messageId, updates) {
    console.log("[PlaygroundService] Updating message", {
      messageId,
      updates,
    });

    try {
      const message = await Message.findByPk(messageId);
      if (!message) {
        return {
          success: false,
          message: "Message not found",
        };
      }

      if (updates.text) {
        updates.tokens = await calculateTokens(updates.text);
      }

      await message.update(updates);

      return {
        success: true,
        data: {
          message,
        },
      };
    } catch (error) {
      console.error("[PlaygroundService] Error updating message:", error);
      return {
        success: false,
        message: "Failed to update message",
      };
    }
  }

  async getConversationHistory(conversationId) {
    console.log("[PlaygroundService] Getting conversation history", {
      conversationId,
    });

    try {
      const messages = await Message.findAll({
        where: {
          conversationId,
          status: "completed",
          role: {
            [Op.ne]: "system",
          },
        },
        order: [["createdAt", "ASC"]],
      });

      return {
        success: true,
        data: {
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.text,
          })),
        },
      };
    } catch (error) {
      console.error(
        "[PlaygroundService] Error getting conversation history:",
        error
      );
      return {
        success: false,
        message: "Failed to get conversation history",
      };
    }
  }

  async recordUsage({ agentId, type, input, output }) {
    console.log("[PlaygroundService] Recording usage", {
      agentId,
      type,
    });

    try {
      const inputTokens = await calculateTokens(input);
      const outputTokens = await calculateTokens(output);

      const inputCost = inputTokens * 0.0001;
      const outputCost = outputTokens * 0.0002;
      const totalCost = (inputCost + outputCost).toFixed(6);

      await Usage.create({
        agentId,
        type: "playground",
        inputTokens,
        outputTokens,
        cost: totalCost,
        metadata: {
          timestamp: new Date(),
          inputCost,
          outputCost,
        },
      });

      return {
        success: true,
        data: {
          inputTokens,
          outputTokens,
          cost: totalCost,
        },
      };
    } catch (error) {
      console.error("[PlaygroundService] Error recording usage:", error);
      return {
        success: false,
        message: "Failed to record usage",
      };
    }
  }

  async getPlaygroundAgent(userId) {
    console.log("[PlaygroundService] Finding playground agent", {
      userId,
    });

    try {
      const agent = await Agent.findOne({
        where: {
          userId: userId,
          type: "playground",
          isActive: true,
        },
      });

      if (!agent) {
        return {
          success: false,
          message: "No playground agent found",
        };
      }

      return {
        success: true,
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            prompt: agent.prompt,
          },
        },
      };
    } catch (error) {
      console.error(
        "[PlaygroundService] Error finding playground agent:",
        error
      );
      return {
        success: false,
        message: "Failed to retrieve playground agent",
      };
    }
  }

  async getGpu() {
    console.log("[PlaygroundService] Finding available GPU");

    try {
      const gpu = await Gpu.findOne({
        attributes: ["hostIp"],
      });

      if (!gpu) {
        return {
          success: false,
          message: "No GPU available",
        };
      }

      return {
        success: true,
        data: {
          hostIp: gpu.hostIp,
        },
      };
    } catch (error) {
      console.error("[PlaygroundService] Error finding GPU:", error);
      return {
        success: false,
        message: "Failed to retrieve GPU information",
      };
    }
  }
}

module.exports = PlaygroundService;
