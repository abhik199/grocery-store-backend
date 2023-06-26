const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const RefreshToken = sequelize.define("refresh_token", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

RefreshToken.sync({ alter: true });
module.exports = RefreshToken;
