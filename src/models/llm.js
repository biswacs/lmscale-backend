const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Llm extends Model {}

Llm.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["llama2", "mistral"]],
      },
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
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
    modelName: "Llm",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["name"],
        unique: true,
      },
    ],
  }
);

module.exports = Llm;
