const {
  productModel,
  productImgModel,
  categoryModel,
} = require("../../models/models");
const customErrorHandler = require("../../../config/customErrorHandler");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

exports.getProduct = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name, category, minPrice, maxPrice } = req.query;

    const whereCondition = {};

    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }

    if (category) {
      whereCondition["$category.name$"] = { [Op.like]: `%${category}%` };
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
      },
      include: [
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
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
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
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
    return res.status(200).json({ status: false, product });
  } catch (error) {
    return next(error);
  }
};
