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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
      allowNull: false,
      references: {
        model: "Deployments",
        key: "id",
      },
    },
    botId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Bots",
        key: "id",
      },
    },
    tokensUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM("api", "bot"),
      allowNull: false,
      defaultValue: "api",
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
  },
  {
    sequelize,
    modelName: "Usage",
    timestamps: true,
    indexes: [
      {
        fields: ["date", "userId"],
      },
      {
        fields: ["deploymentId"],
      },
      {
        fields: ["botId"],
      },
      {
        fields: ["type"],
      },
    ],
  }
);

module.exports = Usage;
