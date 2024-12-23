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
    instanceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Instances",
        key: "id",
      },
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
