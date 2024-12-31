const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
    deploymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Deployments",
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Function",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["deploymentId"],
      },
      {
        using: "gin",
        fields: ["parameters"],
      },
    ],
  }
);

module.exports = Function;
