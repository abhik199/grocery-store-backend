const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const forgotPassword = sequelize.define("forgot_password", {
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
  expiration_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

forgotPassword.sync({ alter: true });

module.exports = forgotPassword;
