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
  totalAmount: {
    type: DataTypes.FLOAT,
  },
  totalItems: {
    type: DataTypes.INTEGER,
  },
  product_image: {
    type: DataTypes.STRING,
  },
  discount_price: {
    type: DataTypes.FLOAT,
  },
  selectedAddress: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
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
});

// User

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.sync({ alter: true });

module.exports = Order;
