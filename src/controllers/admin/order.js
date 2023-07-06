const { orderModel, productModel } = require("../../models/models");

exports.fetchOrdersByAmin = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name } = req.query;

    const whereCondition = {};

    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    const get_order = await orderModel.findAll({
      where: whereCondition,
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: productModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
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

    return res.status(200).json({ status: true, order: get_order });
  } catch (error) {
    return next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }
  try {
    const order = await orderModel.update(
      {
        status: req.body.status,
      },
      { where: { id: id }, returning: true }
    );
    if (!order) {
      return res
        .status(400)
        .json({ status: false, message: "Status update Failed" });
    }
    return res
      .status(200)
      .json({ status: true, message: "status update successfully" });
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
    const order = await orderModel.findOne({ where: { id: orderId.id } });
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

exports.updateOrder = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }

  try {
    const update_order = await orderModel.update(
      {},
      { where: { id: id }, returning: true }
    );
  } catch (error) {
    return next(error);
  }
};
