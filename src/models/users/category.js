const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const Product = require("./product");

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
});

Category.sync({ alter: false });

module.exports = Category;
