const { cardModel, productModel, userModel } = require("../../models/models");
const joi = require("joi");

exports.fetchCartByUser = async (req, res, next) => {
  const { id } = req.user;
  try {
    const cartItems = await cardModel.findAll({
      where: { userId: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: productModel,
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "description",
              "tag",
              "discount_price",
              "discount_percentage",
              "stock",
              "brand",
            ],
          },
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

exports.addToCart = async (req, res, next) => {
  const { id: userId } = req.user;
  const cardSchema = joi.object({
    quantity: joi.number().required(),
    productId: joi.number().required(),
  });
  const { error } = cardSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  const { productId, quantity } = req.body;
  if (!quantity) {
    return res
      .status(400)
      .json({ status: false, message: "quantity required" });
  }
  if (!productId) {
    return res.status({ status: false, message: "product id required" });
  }

  try {
    const find_productId = await productModel.findOne({
      where: { id: productId },
    });

    if (!find_productId) {
      return res
        .status(400)
        .json({ status: false, message: "Product ID wrong" });
    }

    if (!(quantity <= find_productId.stock)) {
      return res.status(400).json({
        message: "Insufficient stock",
        available_Stock: find_productId.stock,
      });
    }
    const user = await cardModel.findAll({ where: { userId: userId } });

    const existingCartItem = user.find((item) => item.productId === productId);

    if (existingCartItem) {
      const updatedQuantity = existingCartItem.quantity + quantity;
      const updatedSubtotal = find_productId.price * updatedQuantity;

      const updateResult = await cardModel.update(
        { quantity: updatedQuantity, subtotal: updatedSubtotal },
        { where: { id: existingCartItem.id }, returning: true }
      );

      if (updateResult[0] > 0) {
        await update_Stock(find_productId, quantity);
        return res
          .status(200)
          .json({ status: true, message: "Card updated successfully" });
      } else {
        return res
          .status(400)
          .json({ status: false, message: "Failed to update card" });
      }
    } else {
      const cart = await cardModel.create({
        name: find_productId.name,
        thumbnail: find_productId.thumbnail,
        discount_price: find_productId.discount_price,
        quantity: req.body.quantity,
        subtotal: find_productId.discount_price * quantity,
        productId: productId,
        userId: userId,
      });

      if (!cart) {
        return res
          .status(400)
          .json({ status: false, message: "Failed to create card" });
      }

      await update_Stock(find_productId, quantity);

      return res
        .status(201)
        .json({ status: true, message: "Card created successfully" });
    }

    // update stock in product modules
    async function update_Stock(find_productId, quantity) {
      const [affectedRows] = await productModel.update(
        {
          stock: find_productId.stock - quantity,
        },
        { where: { id: find_productId.id } }
      );
    }
  } catch (error) {
    return next(error);
  }
};

exports.deleteFromCart = async (req, res, next) => {
  const { id } = req.params;
  try {
    const card = await cardModel.findOne({ where: { id: id } });
    if (!card) {
      return res.status(400).json({ status: false, message: "card not found" });
    }
    const delete_item = await cardModel.destroy({ where: { id: card.id } });
    if (!delete_item) {
      return res.status(400).json({ status: false, message: "delete failed" });
    }
    return res
      .status(200)
      .json({ status: true, message: 'Cart item deleted successfully"' });
  } catch (error) {
    return next(error);
  }
};

exports.updateCart = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ status: false, message: "" });
  }
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
