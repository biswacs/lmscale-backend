const sequelize = require("../config/database");
const User = require("./user");
const Deployment = require("./deployment");
const Llm = require("./llm");
const Function = require("./function");
const Instruction = require("./instruction");
const Instance = require("./instance");
const Usage = require("./usage");
const Conversation = require("./conversation");
const Message = require("./message");

User.hasMany(Deployment, {
  foreignKey: "userId",
  as: "deployments",
});
User.hasMany(Usage, {
  foreignKey: "userId",
  as: "usages",
});
User.hasMany(Conversation, {
  foreignKey: "userId",
  as: "conversations",
});

Deployment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
Deployment.belongsTo(Llm, {
  foreignKey: "modelId",
  as: "model",
});
Deployment.belongsTo(Instance, {
  foreignKey: "instanceId",
  as: "instance",
});
Deployment.hasOne(Instruction, {
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

Instance.hasMany(Deployment, {
  foreignKey: "instanceId",
  as: "deployments",
});

Llm.hasMany(Deployment, {
  foreignKey: "modelId",
  as: "deployments",
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
Usage.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Conversation.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
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
  Instance,
  Usage,
  Conversation,
  Message,
};
