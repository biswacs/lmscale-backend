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
    hostIp: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIP: true,
      },
    },
    privateIp: {
      type: DataTypes.STRING,
      allowNull: true,
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
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amiId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sshKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    computeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    instanceType: {
      type: DataTypes.ENUM("dedicated", "public"),
      allowNull: false,
      defaultValue: "dedicated",
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    maxConcurrentRequests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "running",
      validate: {
        isIn: [["pending", "running", "stopping", "stopped", "terminated"]], // Valid statuses
      },
    },
    metrics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    securityGroups: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    subnetId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    launchTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    shutdownTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastHealthCheck: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: "Instance",
    timestamps: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["region"] },
      { fields: ["instanceType"] },
    ],
  }
);

module.exports = Instance;
