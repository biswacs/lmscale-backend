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
    publicIp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publicDns: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    config: {
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
        fields: ["loadedModels"],
      },
    ],
  }
);

module.exports = Server;
