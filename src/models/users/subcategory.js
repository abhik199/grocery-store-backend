const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const Category = require("./category");

const subCategory = sequelize.define(
  "subcategory",
  {
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
    // items: {
    //   type: DataTypes.INTEGER,
    // },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["categoryId"],
      },
    ],
  }
);

subCategory.sync({ alter: true });
module.exports = subCategory;
