const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Server extends Model {}

Server.init(
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
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serverType: {
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
      defaultValue: "offline",
      validate: {
        isIn: [["online", "offline", "maintenance", "error"]],
      },
    },
    lastHealthCheck: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resourceMetrics: {
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
    modelName: "Server",
    timestamps: true,
    indexes: [
      {
        fields: ["status"],
      },
      {
        fields: ["serverType"],
      },
    ],
  }
);

module.exports = Server;
