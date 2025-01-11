const sequelize = require("../config/database");
const User = require("./user");
const Assistant = require("./assistant");
const Function = require("./function");
const Instruction = require("./instruction");
const Gpu = require("./gpu");
const Usage = require("./usage");

User.hasMany(Assistant, {
  foreignKey: "userId",
  as: "assistants",
});

Assistant.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Assistant.hasMany(Instruction, {
  foreignKey: "assistantId",
  as: "instructions",
});

Instruction.belongsTo(Assistant, {
  foreignKey: "assistantId",
  as: "assistant",
});

Assistant.hasMany(Function, {
  foreignKey: "assistantId",
  as: "functions",
});

Function.belongsTo(Assistant, {
  foreignKey: "assistantId",
  as: "assistant",
});

Assistant.hasMany(Usage, {
  foreignKey: "assistantId",
  as: "usages",
});

Usage.belongsTo(Assistant, {
  foreignKey: "assistantId",
  as: "assistant",
});

module.exports = {
  sequelize,
  User,
  Assistant,
  Function,
  Instruction,
  Gpu,
  Usage,
};
