const sequelize = require("../config/database");
const User = require("./user");
const Deployment = require("./deployment");

User.hasMany(Deployment, {
  foreignKey: "userId",
  as: "deployments",
});

Deployment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = {
  sequelize,
  User,
  Deployment,
};
