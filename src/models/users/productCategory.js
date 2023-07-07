const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const product = require("./product");
const category = require("./category");

const productCategory = sequelize.define(
  "product_category",
  {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: product,
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: category,
        key: "id",
      },
    },
  },
  { timestamps: false }
);

productCategory.sync();

product.belongsToMany(category, {
  through: productCategory,
  foreignKey: "productId",
});
category.belongsToMany(product, {
  through: productCategory,
  foreignKey: "categoryId",
});

module.exports = productCategory;
