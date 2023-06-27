const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const Category = sequelize.define("category", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  category_name: {
    type: DataTypes.STRING,
  },
  category_image: {
    type: DataTypes.STRING,
  },
});
Category.sync();
module.exports = Category;
