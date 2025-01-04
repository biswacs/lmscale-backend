const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const crypto = require("crypto");

class Agent extends Model {
  async generateNewApiKey() {
    const newApiKey = crypto.randomBytes(32).toString("hex");
    await this.update({
      apiKey: newApiKey,
    });
    return newApiKey;
  }
}

Agent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.toLowerCase());
      },
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: `You are a helpful AI assistant. Please follow these guidelines:
    
    1. Provide accurate, factual information
    2. If uncertain, acknowledge the limitations of your knowledge
    3. Keep responses clear, concise, and relevant to the query
    4. Do not generate harmful, illegal, or malicious content
    5. Maintain a professional and respectful tone
    6. Ask for clarification when needed
    7. Protect user privacy and confidential information 
    
    Please respond to user queries while following these guidelines.`,
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
    modelName: "Agent",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["name", "userId"],
        unique: true,
        name: "unique_name_per_user",
      },
    ],
  }
);

module.exports = Agent;
