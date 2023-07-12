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
  category_images: {
    type: DataTypes.STRING,
  },
  // items: {
  //   type: DataTypes.INTEGER,
  // },
});

Category.sync({ alter: true });

module.exports = Category;
