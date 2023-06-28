const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const Category = sequelize.define("category", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
});
Category.sync();
module.exports = Category;
