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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    deploymentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Deployments",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("standard", "deployment"),
      allowNull: false,
      defaultValue: "standard",
    },
    inputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    outputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Usage",
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "type", "createdAt"],
      },
      {
        fields: ["deploymentId"],
      },
    ],
  }
);

module.exports = Usage;
