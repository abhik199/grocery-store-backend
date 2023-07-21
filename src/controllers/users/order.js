const { orderModel, productModel } = require("../../models/models");
const joi = require("joi");

exports.createOrder = async (req, res, next) => {
  const { id } = req.user;

  try {
    const productId = await productModel.findOne({
      where: { id: req.body.productId },
    });
    if (!productId) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }
    const create_order = await orderModel.create({
      userId: id,
      name: productId.name,
      ...req.body,
    });
    if (!create_order) {
      return res.status(400).json({ status: false, message: "failed order" });
    }
    return res
      .status(201)
      .json({ status: false, message: "order create successfully" });
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
