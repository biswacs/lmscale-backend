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
    host: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isHostPort(value) {
          if (!/^[\w.-]+:\d+$/.test(value)) {
            throw new Error("Host must be in format ip:port or hostname:port");
          }
        },
      },
    },
    specs: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    loadedModels: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "offline",
      validate: {
        isIn: [["online", "offline"]],
      },
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
    modelName: "Server",
    timestamps: true,
    indexes: [
      {
        fields: ["status"],
      },
      {
        using: "gin",
        fields: ["specs", "loadedModels"],
      },
    ],
  }
);

module.exports = Server;
