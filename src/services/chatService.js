const { Agent, Gpu, Message, Usage, Conversation } = require("../models");
const { Op } = require("sequelize");
const { calculateTokens } = require("../utils/tokenizer");
const ConversationService = require("./conversationService");

class ChatService {
  constructor() {
    this.conversationService = new ConversationService();
  }

  async getAgent(agentId) {
    console.log("[ChatService] Finding agent", { agentId });

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

      return {
        success: true,
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            prompt: agent.prompt,
            type: agent.type,
          },
        },
      };
    } catch (error) {
      console.error("[ChatService] Error finding agent:", error);
      return {
        success: false,
        message: "Failed to retrieve agent",
      };
    }
  }

  async createMessage(messageData) {
    console.log("[ChatService] Creating message", messageData);

    try {
      const tokens = await calculateTokens(messageData.text);
      const message = await Message.create({
        ...messageData,
        tokens,
      });

      const messageCount = await Message.count({
        where: { conversationId: messageData.conversationId },
      });

      if (messageCount === 1 && messageData.role === "user") {
        await Conversation.update(
          {
            title: messageData.text.slice(0, 100),
            lastMessageAt: new Date(),
          },
          {
            where: { id: messageData.conversationId },
          }
        );
      } else {
        await Conversation.update(
          {
            lastMessageAt: new Date(),
          },
          {
            where: { id: messageData.conversationId },
          }
        );
      }

      return {
        success: true,
        data: { message },
      };
    } catch (error) {
      console.error("[ChatService] Error creating message:", error);
      return {
        success: false,
        message: "Failed to create message",
      };
    }
  }

  async updateMessage(messageId, updates) {
    console.log("[ChatService] Updating message", { messageId, updates });

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
        data: { message },
      };
    } catch (error) {
      console.error("[ChatService] Error updating message:", error);
      return {
        success: false,
        message: "Failed to update message",
      };
    }
  }

  async getConversationMessages(conversationId) {
    console.log("[ChatService] Getting conversation messages", {
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
      console.error("[ChatService] Error getting messages:", error);
      return {
        success: false,
        message: "Failed to get conversation messages",
      };
    }
  }

  async getGpu() {
    console.log("[ChatService] Finding available GPU");

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
      console.error("[ChatService] Error finding GPU:", error);
      return {
        success: false,
        message: "Failed to retrieve GPU information",
      };
    }
  }

  async recordUsage({ agentId, conversationId, input, output }) {
    console.log("[ChatService] Recording usage", { agentId, conversationId });

    try {
      const inputTokens = await calculateTokens(input);
      const outputTokens = await calculateTokens(output);

      const totalCost = (inputTokens * 0.0001 + outputTokens * 0.0002).toFixed(
        6
      );

      const [usage, created] = await Usage.findOrCreate({
        where: { conversationId },
        defaults: {
          agentId,
          conversationId,
          inputTokens,
          outputTokens,
          cost: totalCost,
        },
      });

      if (!created) {
        await usage.update({
          inputTokens: usage.inputTokens + inputTokens,
          outputTokens: usage.outputTokens + outputTokens,
          cost: (parseFloat(usage.cost) + parseFloat(totalCost)).toFixed(6),
        });
      }

      return {
        success: true,
        data: {
          inputTokens,
          outputTokens,
          cost: totalCost,
        },
      };
    } catch (error) {
      console.error("[ChatService] Error recording usage:", error);
      return {
        success: false,
        message: "Failed to record usage",
      };
    }
  }
}

module.exports = ChatService;
