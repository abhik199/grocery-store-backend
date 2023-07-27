const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

// all of this user information about transactions

const transactions = sequelize.define("transactions", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  product: {
    type: DataTypes.STRING,
  },
  orderId: {
    type: DataTypes.STRING,
  },
  orderDate: {
    type: DataTypes.STRING,
  },
  transactionId: {
    type: DataTypes.STRING,
  },

  amount: {
    type: DataTypes.FLOAT,
  },
  status: {
    type: DataTypes.STRING,
  },
  paymentMethod: {
    type: DataTypes.STRING,
  },
});

transactions.sync();
module.exports = transactions;
