const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const transactions = sequelize.define("transactions", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
});
