const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const user = require("./register");

const RefreshToken = sequelize.define("refresh_token", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,

    references: {
      model: user,
      key: "id",
    },
  },
});

user.hasMany(RefreshToken, {
  foreignKey: "userId",
});
RefreshToken.belongsTo(user, {
  foreignKey: "userId",
});

RefreshToken.sync();
module.exports = RefreshToken;
