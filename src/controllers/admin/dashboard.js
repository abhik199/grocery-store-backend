// orders
// total    last months   last week  today

// users
// total    last months   last week  today

const { userModel, orderModel } = require("../../models/models");
const { Op, Sequelize } = require("sequelize");

exports.dashboardOrder = async (req, res, next) => {
  try {
    if (req.params.total) {
      const totalOrder = await orderModel.count();
      if (totalOrder.length === 0) {
        res.status(404).json({ status: "Active order not found" });
      }
      res.status(200).json({ status: true, order: totalOrder });
    }
    if (req.params.months) {
      const orderCountByMonths = await orderModel.findAll({
        attributes: [
          [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
          [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
          [Sequelize.fn("COUNT", "*"), "orderCount"],
        ],
        group: ["year", "month"],
      });
      if (orderCountByMonths.length === 0) {
        res
          .status(200)
          .json({ status: false, message: "last months no order" });
      }
      res.status(200).json({ status: true, order: orderCountByMonths });
    }
    // Count orders for the last week
    if (req.params.week) {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const orderCountForLastWeek = await orderModel.count({
        where: {
          createdAt: {
            [Op.gte]: lastWeek,
          },
        },
      });
      if (!orderCountForLastWeek) {
        res.status(404).json({ status: false, message: "LastWeek no order" });
      }
      res.status(200).json({ status: true, order: orderCountForLastWeek });
    }
    // Count orders for today
    if (req.params.today) {
      const today = new Date();
      const orderCountForToday = await orderModel.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            ),
          },
        },
      });
      if (orderCountForToday.length === 0) {
        res.status(404).json({ status: false, message: "Today is no order" });
      }
      res.status(200).json({ status: true, order: orderCountForToday });
    }
  } catch (error) {
    return next(error);
  }
};

exports.dashboardUsers = async (req, res, next) => {
  try {
    if (req.params.user === "total") {
      const totalOrder = await userModel.count();
      if (totalOrder.length === 0) {
        res.status(404).json({ status: "Active order not found" });
      }
      res.status(200).json({ status: true, order: totalOrder });
    }
    if (req.params.user === "months") {
      const orderCountByMonths = await userModel.findAll({
        attributes: [
          [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
          [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
          [Sequelize.fn("COUNT", "*"), "orderCount"],
        ],
        group: ["year", "month"],
      });
      if (orderCountByMonths.length === 0) {
        res
          .status(200)
          .json({ status: false, message: "last months no order" });
      }
      res.status(200).json({ status: true, order: orderCountByMonths });
    }
    // Count orders for the last week
    if (req.params.user === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const orderCountForLastWeek = await userModel.count({
        where: {
          createdAt: {
            [Op.gte]: lastWeek,
          },
        },
      });
      if (orderCountForLastWeek.length === 0) {
        res.status(404).json({ status: false, message: "LastWeek no order" });
      }
      res.status(200).json({ status: true, order: orderCountForLastWeek });
    }
    // Count orders for today
    if (req.params.user === "today") {
      const today = new Date();
      const orderCountForToday = await userModel.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            ),
          },
        },
      });
      if (orderCountForToday.length === 0) {
        res.status(404).json({ status: false, message: "Today is no order" });
      }
      res.status(200).json({ status: true, order: orderCountForToday });
    }
  } catch (error) {
    return next(error);
  }
};
