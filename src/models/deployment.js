const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Deployment extends Model {}

Deployment.init(
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
    modelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Models",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "running", "stopped", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
    type: {
      type: DataTypes.ENUM("standard", "bot"),
      allowNull: false,
      defaultValue: "standard",
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        maxTokens: 2000,
        temperature: 0.7,
        rateLimit: 50,
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Deployment",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["modelId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["type"],
      },
    ],
  }
);

module.exports = Deployment;
