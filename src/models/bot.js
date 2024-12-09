const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Bot extends Model {}

Bot.init(
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
    deploymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Deployments",
        key: "id",
      },
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "maintenance"),
      defaultValue: "active",
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    welcomeMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    inputPlaceholder: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rateLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50, // requests per minute
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    allowedDomains: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
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
    modelName: "Bot",
    paranoid: true,
    timestamps: true,
    hooks: {
      beforeValidate: async (bot) => {
        if (bot.name && !bot.slug) {
          bot.slug = bot.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
        }
      },
    },
  }
);

module.exports = Bot;
