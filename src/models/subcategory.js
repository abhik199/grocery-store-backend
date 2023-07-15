const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Category = require("./category");

const subCategory = sequelize.define("subcategory", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  subcategory: {
    type: DataTypes.STRING,
  },
  subcategory_images: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: "id",
    },
  },
  items: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

subCategory.sync({ alter: true });
module.exports = subCategory;
