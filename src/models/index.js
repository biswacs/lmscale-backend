const sequelize = require("../config/database");
const User = require("./user");
const AiModel = require("./aiModel");
const Function = require("./function");
const Instance = require("./instance");
const Instruction = require("./instruction");
const Server = require("./server");
const Usage = require("./usage");

User.hasMany(Instance, {
  foreignKey: "userId",
  as: "instances",
});
User.hasMany(Usage, {
  foreignKey: "userId",
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
Usage.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = {
  sequelize,
  User,
  AiModel,
  Function,
  Instance,
  Instruction,
  Server,
  Usage,
};
