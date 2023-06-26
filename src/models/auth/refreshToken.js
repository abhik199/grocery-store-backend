const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const RefreshToken = sequelize.define("refreshToken", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

RefreshToken.sync({});
module.exports = { RefreshToken };
