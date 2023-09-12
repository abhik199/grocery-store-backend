const { cardModel, productModel } = require("../../models/models");
const joi = require("joi");

exports.fetchCartByUser = async (req, res, next) => {
  const { id } = req.user;
  try {
    const cartItems = await cardModel.findAll({
      where: { userId: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!cartItems) {
      return res.status(400).json({ status: false, message: "card is empty" });
    }
    const modifyCard = cartItems.map((card) => ({
      id: card.id,
      name: card.name,
      thumbnail: card.thumbnail,
      discount_price: card.discount_price,
      quantity: card.quantity,
      subtotal: card.subtotal,
      productId: card.productId,
    }));
    const total = modifyCard.reduce((total, card) => total + card.subtotal, 0);
    const totalPrice = Number(total.toFixed(2));
    const totalQuantity = modifyCard.reduce(
      (total, card) => total + card.quantity,
      0
    );
    return res
      .status(200)
      .json({ status: true, card: modifyCard, totalPrice, totalQuantity });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  const { id: userId } = req.user;
  const cardSchema = joi.object({
    productId: joi.number().required(),
    quantity: joi.number().optional(),
  });
  const { error } = cardSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  const { productId, quantity } = req.body;

  const q = quantity ?? 1; // Use the provided quantity or default to 1

  if (!productId) {
    return res
      .status(400)
      .json({ status: false, message: "product id required" });
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

    if (!(q <= find_productId.stock)) {
      return res.status(400).json({
        message: "Insufficient stock",
        available_Stock: find_productId.stock,
      });
    }
    const user = await cardModel.findAll({ where: { userId: userId } });

    const existingCartItem = user.find((item) => item.productId === productId);

    if (existingCartItem) {
      const updatedQuantity = existingCartItem.quantity + q;
      const updatedSubtotal = find_productId.price * updatedQuantity;

      const updateResult = await cardModel.update(
        { quantity: q, subtotal: find_productId.discount_price * q },
        { where: { id: existingCartItem.id }, returning: true }
      );

      if (updateResult) {
        // after delivered product then update product
        // await update_Stock(find_productId, q);
         const card = await cardModel.findAll({ where: { userId: userId } });

        return res
          .status(200)
          .json({ status: true, message: "Card updated successfully",card});
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
        quantity: q,
        subtotal: find_productId.discount_price * q,
        productId: productId,
        userId: userId,
      });

      if (!cart) {
        return res
          .status(400)
          .json({ status: false, message: "Failed to create card" });
      }
      // after delivered product then update product
      // await update_Stock(find_productId, q);
       const card = await cardModel.findAll({ where: { userId: userId } });

      return res
        .status(201)
        .json({ status: true, message: "Card created successfully",card });
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

// Delete Card Items
exports.deleteFromCart = async (req, res, next) => {
  const { id } = req.params;
  try {
    const card = await cardModel.findOne({ where: { id: id } });
    if (!card) {
      return res.status(400).json({ status: false, message: "card not found" });
    }
    const delete_item = await cardModel.destroy({ where: { id: card.id } });
    if (delete_item === 1) {
      return res
        .status(200)
        .json({ status: true, message: 'Cart item deleted successfully"' });
    }
    return res.status(400).json({ status: false, message: "delete failed" });
  } catch (error) {
    return next(error);
  }
};

// Update Card Quantity
exports.updateCart = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  if (!id) {
    return res.status(400).json({ status: false, message: "card id required" });
  }
  try {
    const price = await cardModel.findOne({ where: { id: id } });
    if (!price) {
      return res.status(400).json({ status: false, message: "Card it wrong" });
    }
    const product = await productModel.findOne({
      where: { id: price.productId },
    });

    // if (!(req.body.quantity >=1)) {
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Quantity must be greater than 0" });
    // }

    if (!(req.body.quantity <= product.stock)) {
      return res.status(400).json({
        message: "Insufficient stock",
        available_Stock: product.stock,
      });
    }

    const updatedCart = await cardModel.update(
      {
        quantity: req.body.quantity,
        subtotal: price.discount_price * req.body.quantity,
      },
      { where: { id: id }, returning: true }
    );
    if (req.body.quantity === 0) {
      await cardModel.destroy({ where: { id: id } });
      const card = await cardModel.findAll({ where: { userId: userId } });
      return res
        .status(200)
        .json({ status: false, message: "card remove successfully", card });
    }
    const card = await cardModel.findAll({ where: { userId: userId } });

    if (updatedCart[1] === 1) {
      return res.status(200).json({
        status: true,
        message: "card update successfully",
        card,
      });
    }

    if (updatedCart === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
  } catch (error) {
    return next(error);
  }
};
