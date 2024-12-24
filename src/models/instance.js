const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Instance extends Model {}

Instance.init(
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
        model: "AiModels",
        key: "id",
      },
    },
    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Servers",
        key: "id",
      },
    },
    instanceType: {
      type: DataTypes.ENUM("dedicated", "public"),
      allowNull: false,
      defaultValue: "dedicated",
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Instance",
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
        fields: ["serverId"],
      },
      { fields: ["instanceType"] },
    ],
  }
);

module.exports = Instance;
