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
