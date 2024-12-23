const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Usage extends Model {}

Usage.init(
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
    apiKeyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ApiKeys",
        key: "id",
      },
    },
    inputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    outputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    cost: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
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
    modelName: "Usage",
    timestamps: true,
    indexes: [
      {
        fields: ["instanceId", "createdAt"],
      },
      {
        fields: ["apiKeyId"],
      },
    ],
  }
);

module.exports = Usage;
