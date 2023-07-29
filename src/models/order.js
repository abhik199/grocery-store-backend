const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const User = require("./auth/register");
const paymentMethods = ["card", "cash"];

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  thumbnail: {
    type: DataTypes.STRING,
  },
  discount_price: {
    type: DataTypes.FLOAT,
  },
  totalItems: {
    type: DataTypes.INTEGER,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
  },
  address: {
    type: DataTypes.STRING,
  },

  method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Dispatched", "Delivered", "Cancelled"),
    defaultValue: "Pending",
  },
  order_id: {
    type: DataTypes.STRING,
  },
  productId: {
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

// User

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.sync({ alter: true });

module.exports = Order;
