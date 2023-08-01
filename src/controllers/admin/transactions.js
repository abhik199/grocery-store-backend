const { default: axios } = require("axios");
const { key_id, Key_Secret } = require("../../../config/env/development");
const { transactionsModels } = require("../../models/models");

exports.fetchAllTransactionsByAdmin = async (req, res, next) => {
  try {
    const transactions = await transactionsModels.findAll({});
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "transactions not found" });
    }
    return res.status(200).json({ status: true, transactions });
  } catch (error) {
    return next(error);
  }
};

exports.fetchTransactionsById = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "ID required" });
  }
  try {
    const transactionsId = await transactionsModels.findOne({
      where: { id: id },
    });
    if (!transactionsId) {
      return res
        .status(400)
        .json({ status: false, message: "transactions Id not found" });
    }
    const transactions = await transactionsModels.findOne({
      where: { id: transactionsId.id },
    });
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "transactions not found" });
    }
    return res.status(200).json({ status: true, transactions });
  } catch (error) {
    return next(error);
  }
};

exports.deleteTransactions = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "ID required" });
  }
  try {
    const transactionsId = await transactionsModels.findOne({
      where: { id: id },
    });
    if (!transactionsId) {
      return res
        .status(400)
        .json({ status: false, message: "transactions Id not found" });
    }
    const transactions = await transactionsModels.destroy({
      where: { id: transactionsId.id },
    });
    if (!transactions) {
      return res
        .status(400)
        .json({ status: false, message: "failed to delete" });
    }
    return res.status(200).json({ status: true, transactions });
  } catch (error) {
    return next(error);
  }
};

// create transaction automatically using payment gateway api

exports.createTransactions = async (req, res, next) => {
  try {
    const fetchPayments = "https://api.razorpay.com/v1/payments";

    const headers = {
      Authorization: `Basic ${Buffer.from(`${key_id}:${Key_Secret}`).toString(
        "base64"
      )}`,
    };

    const payments = await axios.get(fetchPayments, { headers });
    const getPayments = payments.data.items; // Assuming 'items' holds the payment data array

    const newTransactions = [];

    for (const payment of getPayments) {
      const transactionId = payment.id;

      const existingTransaction = await transactionsModels.findOne({
        where: { transaction_id: transactionId },
      });

      if (existingTransaction) {
        continue;
      }

      const createdTimestamp = payment.created_at;
      const date = new Date(createdTimestamp * 1000);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();

      const newTransaction = {
        email: payment.email,
        contact: payment.contact,
        order_id: payment.order_id,
        amount: payment.amount / 100,
        method: payment.method,
        method_type: payment.wallet,
        status: payment.status,
        created_date: formattedDate,
        created_time: formattedTime,
        transaction_id: transactionId,
      };

      newTransactions.push(newTransaction);
    }

    if (newTransactions.length === 0) {
      return false;
    }

    const createdTransactions = await transactionsModels.bulkCreate(
      newTransactions
    );

    if (!createdTransactions) {
      return res
        .status(400)
        .json({ status: false, message: "Failed to create transactions" });
    }
  } catch (error) {
    console.log(error);
  }
};
