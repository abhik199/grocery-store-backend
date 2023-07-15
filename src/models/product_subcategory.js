const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Product = require("./product");
const Subcategory = require("./subcategory");

const productSubCategory = sequelize.define(
  "product_subcategory",
  {
    subcategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Subcategory,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
  },
  { timestamps: false }
);
Product.belongsToMany(Subcategory, {
  foreignKey: "productId",
  through: productSubCategory,
});
Subcategory.belongsToMany(Product, {
  foreignKey: "subcategoryId",
  through: productSubCategory,
});

productSubCategory.sync({ alter: true });
module.exports = productSubCategory;
