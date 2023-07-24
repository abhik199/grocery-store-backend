const { Op } = require("sequelize");
const { orderModel, productModel, userModel } = require("../../models/models");

exports.fetchAllOrderByAdmin = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { items } = req.query;

    const whereCondition = {};

    if (items) {
      whereCondition.items = { [Op.like]: `%${items}%` };
    }
    const get_order = await orderModel.findAll({
      where: whereCondition,
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: userModel,
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "roles",
              "verification_token",
              "expiration_time",
              "is_verify",
              "profile",
              "password",
              "email",
            ],
          },
        },
      ],
      offset: offset,
      limit: limit,
    });
    console.log(get_order);
    if (get_order.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "order not found" });
    }
    const totalCount = await orderModel.count();

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: true,
      order: get_order,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ status: false, message: "Status is required" });
    }

    const [rowsAffected, updatedOrders] = await orderModel.update(
      { status: status },
      { where: { id: id }, returning: true }
    );

    if (rowsAffected > 0) {
      return res.status(200).json({
        status: true,
        message: "Status update successful",
        updatedOrders,
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "Status update failed. Order not found.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

exports.fetchOrdersById = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }

  try {
    const orderId = await orderModel.findOne({ where: { id: id } });
    if (!orderId) {
      return res
        .status(400)
        .json({ status: false, message: "Order id not valid" });
    }
    const order = await orderModel.findOne({
      where: { id: orderId.id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: userModel,
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "password",
              "profile",
              "is_verify",
              "expiration_time",
              "verification_token",
              "roles",
            ],
          },
        },
      ],
    });
    if (order.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "order not found" });
    }
    return res.status(200).json({ status: false, order });
  } catch (error) {
    return next(error);
  }
};

// delete
