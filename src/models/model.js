const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class LLM extends Model {}

LLM.init(
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
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("chat", "code"),
      allowNull: false,
    },
    pricePerToken: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      validate: {
        min: 0,
      },
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
    modelName: "Model",
    paranoid: true,
    timestamps: true,
  }
);

module.exports = LLM;
