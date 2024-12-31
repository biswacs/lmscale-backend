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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
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
