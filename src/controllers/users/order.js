const {
  orderModel,
  productModel,
  userModel,
  cardModel,
  addressesModel,
} = require("../../models/models");
const joi = require("joi");
const { creteOrderId } = require("./payment");
const generateInvoice = require("../../utils/generateInvoice");
const invoiceService = require("../../services/invoiceSendServices");

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
      const createdOrders = [];
      for (const cardItem of checkCard) {
        const create_order = await orderModel.create({
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
        if (!create_order) {
          return res
            .status(400)
            .json({ status: false, message: "Failed to create order" });
        }
        createdOrders.push(create_order);
      }
      // update stock
      for (const order of createdOrders) {
        const product = await productModel.findOne({
          where: { id: order.productId },
        });
        await productModel.update(
          { stock: product.stock - order.totalItems },
          { where: { id: order.productId }, returning: true }
        );
      }
      // let userOrders;

      try {
        const user = await userModel.findOne({
          where: { id: createdOrders[0].userId }, // Assuming all orders belong to the same user
        });

        const userOrders = createdOrders.map((order) => ({
          id: order.id,
          name: order.name,
          discount_price: order.discount_price,
          quantity: order.totalItems,
          subtotal: order.totalAmount,
          address: order.address,
          method: order.method,
        }));

        const email = user.email;

        invoiceService(email, userOrders, user);
        generateInvoice(email, userOrders, user);
      } catch (error) {
        console.error("Error processing orders:", error);
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

        if (checkCard.length > 0) {
          const createdOrders = [];
          for (const cardItem of checkCard) {
            const create_order = await orderModel.create({
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
            if (!create_order) {
              return res
                .status(400)
                .json({ status: false, message: "Failed to create order" });
            }
            createdOrders.push(create_order);
          }
          // update stock
          for (const order of createdOrders) {
            const product = await productModel.findOne({
              where: { id: order.productId },
            });
            await productModel.update(
              { stock: product.stock - order.totalItems },
              { where: { id: order.productId }, returning: true }
            );
          }
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
      return res.status(404).json({ status: false, message: "User not valid" });
    }

    const userInOrder = await orderModel.findOne({ where: { id: id } });
    if (!userInOrder) {
      return res.status(404).json({
        status: false,
        message: "User associated with the order not found",
      });
    }

    const order = await orderModel.findOne({
      where: { userId: userId },
    });
    if (!order) {
      return res.status(400).json({
        status: false,
        message: "order not found",
      });
    }

    if (order.status === "Pending") {
      const updateStatus = await orderModel.update(
        {
          status: "Cancelled",
        },
        { where: { id: id }, returning: true }
      );

      if (updateStatus[1] === 1) {
        // update product stock
        const product = await productModel.findOne({
          where: { id: order.productId },
        });
        await productModel.update(
          { stock: product.stock + order.totalItems },
          {
            where: {
              id: order.productId,
            },
          }
        );
        await orderModel.update(
          { totalItems: 0 },
          {
            where: { id: order.id },
            returning: true,
          }
        );

        return res.status(200).json({
          status: true,
          message: "Your order has been successfully cancelled",
        });
      }
      return res.status(400).json({
        status: false,
        message: "Something went wrong",
      });
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
