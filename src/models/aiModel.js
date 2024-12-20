const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class AiModel extends Model {}

AiModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["llama2", "mistral"]],
      },
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["7b", "13b"]],
      },
    },
    pullCommand: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    baseMemoryRequired: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: "AiModel",
    timestamps: true,
    indexes: [
      {
        fields: ["name", "tag"],
        unique: true,
      },
    ],
  }
);

module.exports = AiModel;
