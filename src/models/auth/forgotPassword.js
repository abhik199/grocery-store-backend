const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const forgotPassword = sequelize.define("ForgotPassword", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  expirationTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

forgotPassword.sync();

module.exports = { forgotPassword };
