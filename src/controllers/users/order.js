const {
  orderModel,
  productModel,
  userModel,
  cardModel,
} = require("../../models/models");
const joi = require("joi");

exports.createOrder = async (req, res, next) => {
  const { id } = req.user;
  const user = await userModel.findOne({ where: { id: id } });
  if (!user) {
    return res.status(404).json({ status: false, message: "User not found" });
  }

  try {
    const productId = await productModel.findOne({
      where: { id: req.body.productId },
    });
    if (!productId) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }
    const checkCard = await cardModel.findAll({
      where: { productId: productId.id },
    });
    if (checkCard.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found in card items" });
    }

    const create_order = await orderModel.create({
      name: productId.name,
      ...req.body,
      product_image: productId.thumbnail,
      discount_price: productId.discount_price,
      userId: id,
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

exports.fetchAllOrderByUse = async (req, res, next) => {
  const { id } = req.user;
  const user = await userModel.findOne({ where: { id: id } });
  if (!user) {
    return res.status(400).json({ status: false, message: "User not found" });
  }

  try {
    const Order = await orderModel.findAll({ where: { userId: id } });

    if (Order.length === 0) {
      return res.status(404).json({ status: false, message: "No order found" });
    }
    return res.status(200).json({ status: true, order: Order });
  } catch (error) {
    return next(error);
  }
};
