const { orderModel } = require("../../models/models");
const joi = require("joi");

exports.createOrder = async (req, res, next) => {
  const { id } = req.user;
  try {
    const create_order = await orderModel.create({ userId: id, ...req.body });
    res.send(create_order);
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllProduct = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};
