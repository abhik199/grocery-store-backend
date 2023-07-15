const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const user = require("./auth/register");
const product = require("./product");

const order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: product,
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: user,
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING,
  },
  totalAmount: {
    type: DataTypes.INTEGER,
  },
  totalItems: {
    type: DataTypes.INTEGER,
  },
  product_image: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Dispatched", "Delivered", "Cancelled"), // Pass the allowed
    defaultValue: "Pending",
  },
});

// product
product.hasMany(order, {
  foreignKey: "productId",
});
order.belongsTo(product, {
  foreignKey: "productId",
});

// User

user.hasMany(order, {
  foreignKey: "userId",
});
order.belongsTo(order, {
  foreignKey: "userId",
});

order.sync();

module.exports = order;
