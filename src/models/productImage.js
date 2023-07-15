const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const product = require("./product");

const Images = sequelize.define("product_images", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  images: {
    type: DataTypes.STRING,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: product,
      key: "id",
    },
  },
});
Images.sync({ alter: true });
product.hasMany(Images, {
  foreignKey: "productId",
});
Images.belongsTo(product, {
  foreignKey: "productId",
});
module.exports = Images;
