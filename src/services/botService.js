const { Bot } = require("../models");

class BotService {
  async createBot({ userId, name = "", website }) {
    try {
      console.log("Attempting to crate a bot for userId: ", userId);
      const create = await Bot.create({
        name,
        website,
        userId,
        slug: name.toLowerCase(),
      });
      console.log("Bot created successfuly with id: ", create.id);
      return {
        success: true,
        data: create.id,
        message: "Bot created successfuly.",
      };
    } catch (error) {
      console.error("Error creating bot:", error);
      return {
        success: false,
        message: "Failed to create bot",
      };
    }
  }
}

module.exports = BotService;
