const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const product = require("./product");
const category = require("./category");

const product_category = sequelize.define(
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

product_category.sync();

module.exports = category;
