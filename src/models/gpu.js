const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Gpu extends Model {}

Gpu.init(
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
    hostIp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIP: true,
      },
    },
    hostUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    instanceType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "g4dn.xlarge",
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "available",
      validate: {
        isIn: [["available", "busy", "offline", "maintenance"]],
      },
    },
    activeModels: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxModels: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    metrics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        gpuMemoryUsed: 0,
        gpuUtilization: 0,
        activeRequests: 0,
      },
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastHealthCheck: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Gpu",
    paranoid: true,
    timestamps: true,
    indexes: [{ fields: ["status"] }, { fields: ["region"] }],
  }
);

module.exports = Gpu;
