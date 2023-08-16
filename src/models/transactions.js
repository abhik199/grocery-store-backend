const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Order = require("./order");

// all of this user information about transactions

const transactions = sequelize.define(
  "transactions",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    // username: {
    //   type: DataTypes.STRING,
    // },
    email: {
      type: DataTypes.STRING,
    },
    contact: {
      type: DataTypes.STRING,
    },
    // product: {
    //   type: DataTypes.STRING,
    // },
    order_id: {
      type: DataTypes.STRING,
    },

    transaction_id: {
      type: DataTypes.STRING,
    },

    amount: {
      type: DataTypes.FLOAT,
    },
    order_no: {
      type: DataTypes.STRING,
    },

    method: {
      type: DataTypes.STRING,
    },
    method_type: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    created_date: {
      type: DataTypes.STRING,
    },
    created_time: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: false }
);

transactions.sync({ alter: true });
module.exports = transactions;
