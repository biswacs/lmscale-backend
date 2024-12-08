const sequelize = require("../config/database");
const User = require("./user");
const LLMModel = require("./llmModel");
const Deployment = require("./deployment");
const ApiKey = require("./apiKey");
const Usage = require("./usage");

User.hasMany(Deployment, {
  foreignKey: "userId",
  as: "deployments",
});

User.hasMany(ApiKey, {
  foreignKey: "userId",
  as: "apiKeys",
});

User.hasMany(Usage, {
  foreignKey: "userId",
  as: "usages",
});

Deployment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Deployment.belongsTo(LLMModel, {
  foreignKey: "modelId",
  as: "model",
});

Deployment.hasMany(Usage, {
  foreignKey: "deploymentId",
  as: "usages",
});

ApiKey.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Usage.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Usage.belongsTo(Deployment, {
  foreignKey: "deploymentId",
  as: "deployment",
});

LLMModel.hasMany(Deployment, {
  foreignKey: "modelId",
  as: "deployments",
});

module.exports = {
  sequelize,
  User,
  LLMModel,
  Deployment,
  ApiKey,
  Usage,
};
