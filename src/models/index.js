const sequelize = require("../config/database");
const User = require("./user");
const Agent = require("./agent");
const Function = require("./function");
const Instruction = require("./instruction");
const Gpu = require("./gpu");
const Usage = require("./usage");
const Conversation = require("./conversation");
const Message = require("./message");

User.hasMany(Agent, {
  foreignKey: "userId",
  as: "agents",
});

Agent.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Agent.hasMany(Instruction, {
  foreignKey: "agentId",
  as: "instruction",
});

Agent.hasMany(Function, {
  foreignKey: "agentId",
  as: "functions",
});

Agent.hasMany(Usage, {
  foreignKey: "agentId",
  as: "usages",
});

Agent.hasMany(Conversation, {
  foreignKey: "agentId",
  as: "conversations",
});

Instruction.belongsTo(Agent, {
  foreignKey: "agentId",
  as: "agent",
});

Function.belongsTo(Agent, {
  foreignKey: "agentId",
  as: "agent",
});

Usage.belongsTo(Agent, {
  foreignKey: "agentId",
  as: "agent",
});

Conversation.belongsTo(Agent, {
  foreignKey: "agentId",
  as: "agent",
});

Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
});

Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

module.exports = {
  sequelize,
  User,
  Function,
  Agent,
  Instruction,
  Gpu,
  Usage,
  Conversation,
  Message,
};
