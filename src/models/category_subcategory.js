const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Category = require("./category");
const Subcategory = require("./subcategory");

const category_subcategory = sequelize.define(
  "category_subcategory",
  {
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "id",
      },
    },
    subcategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Subcategory,
        key: "id",
      },
    },
  },
  { timestamps: false }
);

Category.belongsToMany(Subcategory, {
  foreignKey: "categoryId",
  through: category_subcategory,
});
Subcategory.belongsToMany(Category, {
  foreignKey: "subcategoryId",
  through: category_subcategory,
});

category_subcategory.sync();
module.exports = category_subcategory;
