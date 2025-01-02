const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Instruction extends Model {}

Instruction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Agents",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Instruction",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["agentId"],
        unique: true,
      },
    ],
  }
);

module.exports = Instruction;
