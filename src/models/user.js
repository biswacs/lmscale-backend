const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class User extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  async rotateApiKey() {
    const newApiKey = crypto.randomBytes(32).toString("hex");
    await this.update({
      apiKey: newApiKey,
      metadata: {
        ...this.metadata,
        apiKeyCreatedAt: new Date(),
        previousApiKey: this.apiKey,
      },
    });
    return newApiKey;
  }
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
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
    modelName: "User",
    paranoid: true,
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (!user.apiKey) {
          user.apiKey = crypto.randomBytes(32).toString("hex");
        }
      },
    },
  }
);

module.exports = User;
