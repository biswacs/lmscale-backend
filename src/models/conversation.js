const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Conversation extends Model {}

Conversation.init(
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
      type: DataTypes.ENUM("playground", "deployment"),
      allowNull: false,
      defaultValue: "playground",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Conversation",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "type", "createdAt"],
      },
      {
        fields: ["deploymentId"],
      },
      {
        fields: ["lastMessageAt"],
      },
    ],
  }
);

module.exports = Conversation;
