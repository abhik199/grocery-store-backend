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
    unique: true,
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
    defaultValue: true,
  },
  expiration_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  roles: {
    type: DataTypes.ENUM("user", "admin"), // Pass the allowed
    defaultValue: "user",
  },
});

Users.sync();

module.exports = Users;
