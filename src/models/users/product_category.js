const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../../../config/database");
const Category = require("./category");
const Product = require("./product");
const Subcategory = require("./subcategory");

const productCategory = sequelize.define(
  "product_category",
  {
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
    subcategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Subcategory,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
  },
  { timestamps: false }
);

// Define associations
Product.belongsToMany(Category, {
  through: productCategory,
  foreignKey: "productId",
});
Category.belongsToMany(Product, {
  through: productCategory,
  foreignKey: "categoryId",
});
Subcategory.belongsToMany(Product, {
  through: productCategory,
  foreignKey: "subcategoryId",
});
Product.belongsToMany(Subcategory, {
  through: productCategory,
  foreignKey: "productId",
});

// Synchronize the models with the database
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Models synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
})();

module.exports = productCategory;
