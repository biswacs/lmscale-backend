const sequelize = require("../config/database");
const User = require("./user");
const Deployment = require("./deployment");
const Llm = require("./llm");
const Function = require("./function");
const Instruction = require("./instruction");
const Gpu = require("./gpu");
const Usage = require("./usage");
const Conversation = require("./conversation");
const Message = require("./message");

User.hasMany(Deployment, {
  foreignKey: "userId",
  as: "deployments",
});

Deployment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Deployment.hasMany(Instruction, {
  foreignKey: "deploymentId",
  as: "instruction",
});

Deployment.hasMany(Function, {
  foreignKey: "deploymentId",
  as: "functions",
});

Deployment.hasMany(Usage, {
  foreignKey: "deploymentId",
  as: "usages",
});

Deployment.hasMany(Conversation, {
  foreignKey: "deploymentId",
  as: "conversations",
});

Instruction.belongsTo(Deployment, {
  foreignKey: "deploymentId",
  as: "deployment",
});

Function.belongsTo(Deployment, {
  foreignKey: "deploymentId",
  as: "deployment",
});

Usage.belongsTo(Deployment, {
  foreignKey: "deploymentId",
  as: "deployment",
});

Conversation.belongsTo(Deployment, {
  foreignKey: "deploymentId",
  as: "deployment",
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
  Llm,
  Function,
  Deployment,
  Instruction,
  Gpu,
  Usage,
  Conversation,
  Message,
};
