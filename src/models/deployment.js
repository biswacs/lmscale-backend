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
      validate: {
        len: [3, 50],
      },
    },
    subdomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-zA-Z0-9-]+$/,
        len: [3, 63],
      },
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "DEPLOYING",
        "ACTIVE",
        "FAILED",
        "STOPPED"
      ),
      defaultValue: "PENDING",
      allowNull: false,
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        theme: "default",
        features: {
          chat: true,
          videoConference: false,
          fileSharing: true,
        },
        customization: {
          logo: null,
          colors: {
            primary: "#007bff",
            secondary: "#6c757d",
          },
        },
      },
    },
    resources: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        cpu: "0.5",
        memory: "1Gi",
        storage: "5Gi",
      },
    },
    technicalConfig: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        version: "1.0.0",
        deploymentUrl: null,
        adminUrl: null,
        apiEndpoint: null,
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastDeployedAt: {
      type: DataTypes.DATE,
    },
    expiresAt: {
      type: DataTypes.DATE,
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
    modelName: "Deployment",
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["subdomain"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["status"],
      },
    ],
    hooks: {
      beforeValidate: async (deployment) => {
        if (deployment.subdomain) {
          deployment.subdomain = deployment.subdomain.toLowerCase();
        }
      },
    },
  }
);

module.exports = Deployment;
