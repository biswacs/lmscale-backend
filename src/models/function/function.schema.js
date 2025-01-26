const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Function extends Model {}

Function.init(
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
    assistantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Assistants",
        key: "id",
      },
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["GET", "POST"]],
      },
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    authType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    isActivated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Function",
    timestamps: true,
    indexes: [
      {
        fields: ["assistantId"],
      },
      {
        using: "gin",
        fields: ["parameters"],
      },
    ],
  }
);

module.exports = Function;
