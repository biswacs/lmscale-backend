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
    instanceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Instances",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Instruction",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["instanceId", "version"],
        unique: true,
      },
    ],
  }
);

module.exports = Instruction;
