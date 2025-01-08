const sequelize = require("../config/database");
const User = require("./user");
const Qubit = require("./qubit");
const Function = require("./function");
const Instruction = require("./instruction");
const Gpu = require("./gpu");
const Usage = require("./usage");

User.hasMany(Qubit, {
  foreignKey: "userId",
  as: "qubits",
});

Qubit.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Qubit.hasMany(Instruction, {
  foreignKey: "qubitId",
  as: "instructions",
});

Instruction.belongsTo(Qubit, {
  foreignKey: "qubitId",
  as: "qubit",
});

Qubit.hasMany(Function, {
  foreignKey: "qubitId",
  as: "functions",
});

Function.belongsTo(Qubit, {
  foreignKey: "qubitId",
  as: "qubit",
});

Qubit.hasMany(Usage, {
  foreignKey: "qubitId",
  as: "usages",
});

Usage.belongsTo(Qubit, {
  foreignKey: "qubitId",
  as: "qubit",
});

module.exports = {
  sequelize,
  User,
  Qubit,
  Function,
  Instruction,
  Gpu,
  Usage,
};
