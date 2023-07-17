const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Product = require("./product");
const Category = require("./category");

const productCategory = sequelize.define(
  "product_category",
  {
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
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

Product.belongsToMany(Category, {
  foreignKey: "productId",
  through: productCategory,
});
Category.belongsToMany(Product, {
  foreignKey: "categoryId",
  through: productCategory,
});
// Product.hasMany(Category, {
//   foreignKey: "productId",
// });
// Category.belongsTo(Product, {
//   foreignKey: "categoryId",
// });

productCategory.sync({ alter: true });
module.exports = productCategory;
