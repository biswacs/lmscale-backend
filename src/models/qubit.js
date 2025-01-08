const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const crypto = require("crypto");

class Qubit extends Model {
  async generateNewApiKey() {
    const newApiKey = crypto.randomBytes(32).toString("hex");
    await this.update({
      apiKey: newApiKey,
    });
    return newApiKey;
  }
}

Qubit.init(
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
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: `You are a helpful AI assistant. Please follow these guidelines:

      1. Provide accurate and helpful information.
      2. If you're unsure about something, feel free to acknowledge that.
      3. Keep responses friendly, clear, and to the point.
      4. Avoid generating harmful, illegal, or inappropriate content.
      5. Be polite, respectful, and considerate.
      6. Ask for clarification if you're not sure what the user wants.
      
      Please assist users with their queries while following these general guidelines.`,
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
    modelName: "Qubit",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
    ],
  }
);

module.exports = Qubit;
