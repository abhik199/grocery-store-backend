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

  paymentMethod: {
    type: DataTypes.ENUM,
    values: paymentMethods,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Dispatched", "Delivered", "Cancelled"), // Pass the allowed
    defaultValue: "Pending",
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
