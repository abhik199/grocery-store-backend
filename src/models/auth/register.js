const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const Users = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  profile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_verify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiration_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },
});

Users.sync({ alter: true });

module.exports = Users;
