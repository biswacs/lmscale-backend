const sequelize = require("../config/database");
const User = require("./user");
const Deployment = require("./deployment");
const Llm = require("./llm");
const Function = require("./function");
const Instruction = require("./instruction");
const Instance = require("./instance");
const Usage = require("./usage");

User.hasMany(Deployment, {
  foreignKey: "userId",
  as: "deployments",
});
User.hasMany(Usage, {
  foreignKey: "userId",
  as: "usages",
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

module.exports = {
  sequelize,
  User,
  Llm,
  Function,
  Deployment,
  Instruction,
  Instance,
  Usage,
};
