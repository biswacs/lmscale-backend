const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Usage extends Model {
  static async getOrCreateDaily(agentId) {
    const today = new Date().toISOString().split("T")[0];

    const [usage] = await this.findOrCreate({
      where: {
        agentId,
        date: today,
      },
      defaults: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
    });
    return usage;
  }

  async incrementTokens(inputTokens, outputTokens) {
    const totalTokens = inputTokens + outputTokens;
    return this.increment({
      inputTokens,
      outputTokens,
      totalTokens,
    });
  }
}

Usage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Agents",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    inputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    outputTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalTokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Usage",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["agentId", "date"],
        unique: true,
      },
    ],
  }
);

module.exports = Usage;
