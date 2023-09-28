const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const Users = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
  },
  last_name: {
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
  },
  default_address: {
    type: DataTypes.STRING,
  },
  is_verify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiration_time: {
    type: DataTypes.DATE,
  },
  verification_token: {
    type: DataTypes.STRING,
  },
  roles: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user",
  },
});

Users.sync({ alter: true });

module.exports = Users;
