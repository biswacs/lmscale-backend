const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Function extends Model {}

Function.init(
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
    qubitId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Qubits",
        key: "id",
      },
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["GET", "POST"]],
      },
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    authType: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    sequelize,
    modelName: "Function",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ["qubitId"],
      },
      {
        using: "gin",
        fields: ["parameters"],
      },
    ],
  }
);

module.exports = Function;
