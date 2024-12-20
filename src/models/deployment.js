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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9-]+$/,
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("chat", "code", "image"),
      allowNull: false,
      defaultValue: "chat",
    },
    modelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Models",
        key: "id",
      },
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        maxTokens: 2000,
        temperature: 0.7,
        rateLimit: 50,
      },
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "maintenance"),
      defaultValue: "active",
      allowNull: false,
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
    modelName: "Deployment",
    timestamps: true,
    hooks: {
      beforeValidate: async (deployment) => {
        if (deployment.name && !deployment.slug) {
          deployment.slug = deployment.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
        }
      },
    },
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["modelId"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = Deployment;
