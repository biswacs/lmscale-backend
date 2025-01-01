const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const crypto = require("crypto");

class Deployment extends Model {
  async generateNewApiKey() {
    const newApiKey = crypto.randomBytes(32).toString("hex");
    await this.update({
      apiKey: newApiKey,
      metadata: {
        ...this.metadata,
        apiKeyCreatedAt: new Date(),
        previousApiKey: this.apiKey,
      },
    });
    return newApiKey;
  }
}

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
    description: {
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
    apiKey: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      defaultValue: () => crypto.randomBytes(32).toString("hex"),
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
    ],
  }
);

module.exports = Deployment;
