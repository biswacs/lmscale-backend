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
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    pullCommand: {
      type: DataTypes.TEXT,
      allowNull: false,
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
        fields: ["name"],
        unique: true,
      },
    ],
  }
);

module.exports = AiModel;
