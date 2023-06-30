const { cardModel, productModel } = require("../../models/models");

exports.fetchCartByUser = async (req, res, next) => {
  const { id } = req.user;
  try {
    const cartItems = await cardModel.findAll({
      where: { userId: id },
      include: [
        {
          model: productModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!cartItems) {
      return res.status(400).json({ status: false, message: "card is empty" });
    }
    return res.status(200).json({ status: true, card: cartItems });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

exports.addToCart = async (req, res) => {
  const { id: userId } = req.user;
  const { productId, quantity } = req.body;
  console.log(userId);
  if (!quantity) {
    return res
      .status(400)
      .json({ status: false, message: "quantity required" });
  }
  if (!productId) {
    return res.status({ status: false, message: "product id required" });
  }

  try {
    const cart = await cardModel.create({
      quantity: quantity,
      productId: productId,
      userId: userId,
    });

    const result = await cardModel.findOne({
      where: { id: cart.id },
      include: [
        {
          model: productModel,
          as: "product",
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!result) {
      return res.status(400).json({ status: false, message: "card created" });
    }
    return res.status(201).json({ status: true, message: "card found", cart });
  } catch (error) {
    return next(error);
  }
};

exports.deleteFromCart = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await cardModel.findByPk(id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    await cardModel.destroy();

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.updateCart = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rowsUpdated, [updatedCart]] = await cardModel.update(req.body, {
      where: { id: id },
      returning: true,
    });

    if (rowsUpdated === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const result = await cardModel.findOne({
      where: { id: updatedCart.id },
      include: [
        {
          model: productModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });

    if (!result) {
      return res.status(400).json({ status: false, message: "Update failed" });
    }
    return result
      .status(200)
      .json({ status: true, message: "card update successfully" });
  } catch (error) {
    return next(error);
  }
};
