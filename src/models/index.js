const sequelize = require("../config/database");
const User = require("./user/user.schema");
const Assistant = require("./assistant/assistant.schema");
const Function = require("./function/function.schema");
const Instruction = require("./instruction/instruction.schema");
const Gpu = require("./gpu/gpu.schema");
const Usage = require("./usage/usage.schema");

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
