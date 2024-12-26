const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Message extends Model {}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Conversations",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("user", "ai", "system"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "error"),
      allowNull: false,
      defaultValue: "completed",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Message",
    timestamps: true,
    indexes: [
      {
        fields: ["conversationId", "createdAt"],
      },
      {
        fields: ["role"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = Message;
