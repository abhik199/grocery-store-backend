const {
  orderModel,
  productModel,
  userModel,
  cardModel,
} = require("../../models/models");
const joi = require("joi");
const { creteOrderId } = require("./payment");

exports.createOrder = async (req, res, next) => {
  const { id } = req.user;

  const user = await userModel.findOne({ where: { id: id } });
  if (!user) {
    return res.status(404).json({ status: false, message: "User not found" });
  }

  try {
    const { address, paymentMethod } = req.body;

    if (!address) {
      return res
        .status(400)
        .json({ status: false, message: "Address must be required" });
    }

    if (!(paymentMethod === "COD" || paymentMethod === "online")) {
      return res.status(400).json({
        status: false,
        message: "Payment allowed only in cash on delivery and Online",
      });
    }
    const checkCard = await cardModel.findAll({
      where: { userId: user.id },
    });

    if (checkCard.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found in card items" });
    }
    if (paymentMethod === "COD") {
      // For COD payment, delete items from the user's card
      let create_order;
      if (checkCard.length > 0) {
        for (const cardItem of checkCard) {
          create_order = await orderModel.create({
            name: cardItem.name,
            thumbnail: cardItem.thumbnail,
            discount_price: cardItem.discount_price,
            totalItems: cardItem.quantity,
            totalAmount: cardItem.subtotal,
            address: req.body.address,
            method: req.body.paymentMethod,
            userId: id,
            productId: cardItem.productId,
          });
        }
      }

      if (!create_order) {
        return res
          .status(400)
          .json({ status: false, message: "Failed to create order" });
      }

      await cardModel.destroy({ where: { userId: id } });
      return res
        .status(201)
        .json({ status: true, message: "Order created successfully (COD)" });
    } else if (paymentMethod === "online") {
      const amount = checkCard.reduce(
        (total, card) => total + card.subtotal,
        0
      );

      const response = await creteOrderId(amount);
      if (response) {
        res.status(201).json({
          status: true,
          message: "Order created successfully (online payment)",
          order_id: response.order.id,
          amount: response.order.amount / 100,
        });
        let create_order;
        if (checkCard.length > 0) {
          for (const cardItem of checkCard) {
            create_order = await orderModel.create({
              name: cardItem.name,
              thumbnail: cardItem.thumbnail,
              discount_price: cardItem.discount_price,
              totalItems: cardItem.quantity,
              totalAmount: cardItem.subtotal,
              address: req.body.address,
              method: req.body.paymentMethod,
              userId: id,
              productId: cardItem.productId,
              order_id: response.order.id,
            });
          }
        }

        if (!create_order) {
          return res
            .status(400)
            .json({ status: false, message: "Failed to create order" });
        }
      }
    }
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
    const Order = await orderModel.findAll({
      where: { userId: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (Order.length === 0) {
      return res.status(404).json({ status: false, message: "No order found" });
    }
    return res.status(200).json({ status: true, order: Order });
  } catch (error) {
    return next(error);
  }
};

exports.requestCancelOrder = async (req, res, next) => {
  const { id: userId } = req.user;
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }

  try {
    const user = await userModel.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const order = await orderModel.findOne({ where: { id: id } });
    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });
    }

    if (order.status === "Pending") {
      const updateStatus = await orderModel.update(
        { status: "Cancelled" },
        { where: { id: id }, returning: true }
      );

      if (updateStatus[0] > 0) {
        return res.status(200).json({
          status: true,
          message: "Your order has been successfully cancelled",
        });
      }
      return;
    }

    if (order.status === "Cancelled") {
      return res
        .status(400)
        .json({ status: false, message: "Your order is already cancelled" });
      return;
    }

    return res.status(200).json({
      status: true,
      message: `You cannot cancel the order because its status is ${order.status}`,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchOrderById = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(200).json({ status: false, message: "Id required" });
  }
  try {
    const orderId = await orderModel.findOne({
      where: { id: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!orderId) {
      return res
        .status(404)
        .json({ status: false, message: "order not found" });
    }
    return res.status(200).json({ status: true, order: orderId });
  } catch (error) {
    return next(error);
  }
};
