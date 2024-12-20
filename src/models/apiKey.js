const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const crypto = require("crypto");

class ApiKey extends Model {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }
}

ApiKey.init(
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
    key: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastUsed: {
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ApiKey",
    paranoid: true,
    timestamps: true,
    hooks: {
      beforeCreate: async (apiKey) => {
        if (!apiKey.key) {
          apiKey.key = ApiKey.generateKey();
        }
      },
    },
    indexes: [
      {
        fields: ["userId"],
      },
    ],
  }
);

module.exports = ApiKey;
