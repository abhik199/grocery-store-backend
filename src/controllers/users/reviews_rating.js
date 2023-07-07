const {
  reviews_ratingModel,
  productModel,
  userModel,
} = require("../../models/models");

exports.createProductReviews = async (req, res, next) => {
  const { id } = req.user;
  const productId = req.body.productId;
  const comment = req.body.comment;
  const rating = req.body.rating;

  if (!productId || !comment || !rating) {
    return res.status(400).json({ status: false, message: "Required Field" });
  }

  try {
    const user = await userModel.findOne({ where: { id: id } });
    const name = `${user.first_name} ${user.last_name}`;

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if the product exists
    const product = await productModel.findOne({ where: { id: productId } });

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    // Check if the user has already reviewed the product
    const existingReview = await reviews_ratingModel.findOne({
      where: { userId: id, productId: productId },
    });

    if (existingReview) {
      return res.status(400).json({
        status: false,
        message: "You have already reviewed this product",
      });
    }

    const createReview = await reviews_ratingModel.create({
      userId: id,
      productId: productId,
      name: name,
      rating: rating,
      comment: comment,
    });

    res.status(201).json({
      status: true,
      message: "Review created successfully",
      review: createReview,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllReviews = async (req, res, next) => {
  try {
  } catch (error) {}
};
