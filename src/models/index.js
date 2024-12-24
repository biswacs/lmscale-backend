const sequelize = require("../config/database");
const User = require("./user");
const AiModel = require("./aiModel");
const ApiKey = require("./apiKey");
const Function = require("./function");
const Instance = require("./instance");
const Instruction = require("./instruction");
const Server = require("./server");
const Usage = require("./usage");

User.hasMany(ApiKey, {
  foreignKey: "userId",
  as: "apiKeys",
});
User.hasOne(Instance, {
  foreignKey: "userId",
  as: "instances",
});

ApiKey.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
ApiKey.hasMany(Usage, {
  foreignKey: "apiKeyId",
  as: "usages",
});

Instance.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
Instance.belongsTo(AiModel, {
  foreignKey: "modelId",
  as: "model",
});
Instance.belongsTo(Server, {
  foreignKey: "serverId",
  as: "server",
});
Instance.hasOne(Instruction, {
  foreignKey: "instanceId",
  as: "instruction",
});
Instance.hasMany(Function, {
  foreignKey: "instanceId",
  as: "functions",
});
Instance.hasMany(Usage, {
  foreignKey: "instanceId",
  as: "usages",
});

Server.hasMany(Instance, {
  foreignKey: "serverId",
  as: "instances",
});

AiModel.hasMany(Instance, {
  foreignKey: "modelId",
  as: "instances",
});

Instruction.belongsTo(Instance, {
  foreignKey: "instanceId",
  as: "instance",
});

Function.belongsTo(Instance, {
  foreignKey: "instanceId",
  as: "instance",
});

Usage.belongsTo(Instance, {
  foreignKey: "instanceId",
  as: "instance",
});
Usage.belongsTo(ApiKey, {
  foreignKey: "apiKeyId",
  as: "apiKey",
});

module.exports = {
  sequelize,
  User,
  AiModel,
  ApiKey,
  Function,
  Instance,
  Instruction,
  Server,
  Usage,
};
