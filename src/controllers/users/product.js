const {
  productModel,
  productImgModel,
  categoryModel,
  reviews_ratingModel,
} = require("../../models/models");
const customErrorHandler = require("../../../config/customErrorHandler");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { sequelize } = require("../../../config/database");

productModel.hasMany(reviews_ratingModel, {
  foreignKey: "productId",
  as: "review",
});
reviews_ratingModel.belongsTo(productModel, {
  foreignKey: "productId",
  as: "review",
});

exports.getProduct = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name, category, minPrice, maxPrice, brand } = req.query;

    const whereCondition = {};

    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }

    if (category) {
      whereCondition["$categories.name$"] = { [Op.like]: `%${category}%` };
    }
    if (brand) {
      whereCondition.brand = { [Op.like]: `%${brand}%` };
    }

    if (minPrice && maxPrice) {
      whereCondition.price = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice) {
      whereCondition.price = { [Op.gte]: minPrice };
    } else if (maxPrice) {
      whereCondition.price = { [Op.lte]: maxPrice };
    }

    const { count, rows: products } = await productModel.findAndCountAll({
      where: whereCondition,
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "stock",
          "description",
          "discount_percentage",
        ],
        include: [
          [
            sequelize.literal(
              "(SELECT AVG(rating) FROM reviews_and_ratings WHERE reviews_and_ratings.productId = product.id)"
            ),
            "rating",
          ],
        ],
      },
      include: [
        {
          model: categoryModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          as: "categories",
          through: { attributes: [] },
        },
      ],
      offset: offset,
      limit: limit,
    });

    const totalCount = await productModel.count();

    if (count === 0) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully.",
      data: products,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSingleProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "product id required" });
  }

  try {
    const product = await productModel.findOne({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      where: { id: id },
      include: [
        [
          sequelize.literal(
            "(SELECT AVG(rating) FROM reviews_and_ratings WHERE reviews_and_ratings.productId = product.id)"
          ),
          "rating",
        ],
      ],

      include: [
        {
          model: reviews_ratingModel, // Change the model name to "reviews_ratingModel"
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          as: "review", // Use the original alias "reviews_and_ratings"
        },
        {
          model: categoryModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          as: "categories", // Specify the alias used for the category association
          through: { attributes: [] }, // Exclude the join table attributes
        },
        {
          model: productImgModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!product) {
      return res
        .status(400)
        .json({ status: false, message: "product not found" });
    }
    return res.status(200).json({ status: true, product });
  } catch (error) {
    return next(error);
  }
};
