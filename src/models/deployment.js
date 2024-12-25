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
    llmId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Llms",
        key: "id",
      },
    },
    instanceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Instances",
        key: "id",
      },
    },
    deploymentType: {
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
    modelName: "Deployment",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["llmId"],
      },
      {
        fields: ["instanceId"],
      },
      { fields: ["deploymentType"] },
    ],
  }
);

module.exports = Deployment;
