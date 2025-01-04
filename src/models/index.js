const sequelize = require("../config/database");
const User = require("./user");
const Agent = require("./agent");
const Function = require("./function");
const Instruction = require("./instruction");
const Gpu = require("./gpu");
const Usage = require("./usage");

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
  as: "instructions",
});

Instruction.belongsTo(Agent, {
  foreignKey: "agentId",
  as: "agent",
});

Agent.hasMany(Function, {
  foreignKey: "agentId",
  as: "functions",
});

Function.belongsTo(Agent, {
  foreignKey: "agentId",
  as: "agent",
});

Agent.hasMany(Usage, {
  foreignKey: "agentId",
  as: "usages",
});

Usage.belongsTo(Agent, {
  foreignKey: "agentId",
  as: "agent",
});

module.exports = {
  sequelize,
  User,
  Agent,
  Function,
  Instruction,
  Gpu,
  Usage,
};
