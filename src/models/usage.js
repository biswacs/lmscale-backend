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
    instanceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Instances",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("chat", "instance"),
      allowNull: false,
      defaultValue: "chat",
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
        fields: ["instanceId"],
      },
    ],
  }
);

module.exports = Usage;
