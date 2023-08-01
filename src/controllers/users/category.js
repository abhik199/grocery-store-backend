const { Op, Sequelize } = require("sequelize");
const joi = require("joi");
const env = require("../../../config/env/development");
const {
  categoryModel,
  productModel,
  productImgModel,
  subcategoryModel,
  reviews_ratingModel,
} = require("../../models/models");
const { sequelize } = require("../../../config/database");
const productCategory = require("../../models/product_category");

exports.getCategory = async (req, res, next) => {
  try {
    const { name } = req.query;

    const whereCondition = {};
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    const category = await categoryModel.findAll({
      where: whereCondition,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!category || category.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "category not found" });
    }

    const modifiedCategory = category.map((cat) => ({
      id: cat.id,
      name: cat.name,
      category_images: cat.category_images,
      items: cat.items,
    }));

    return res.status(200).json({ status: true, data: modifiedCategory });
  } catch (error) {
    return next(error);
  }
};

// For the Get All product by category Id
// sir this is my code
exports.fetchAllByCategoryId = async (req, res, next) => {
  console.log(req.params.id);
  const idSchema = joi.object({
    id: joi.number().required(),
  });
  const { error } = idSchema.validate(req.params);
  if (error) {
    return next(error);
  }

  try {
    const categoryId = await categoryModel.findOne({
      where: { id: req.params.id },
    });
    if (!categoryId) {
      return res
        .status(400)
        .json({ status: false, message: "category id wrong" });
    }

    // get all product
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name, brand, subcategory, minPrice, maxPrice, sort } = req.query;
    const whereCondition = {};

    let orderField, orderDirection;
    switch (sort) {
      case "popularity":
        orderField = "popularity";
        break;
      case "latest":
        orderField = "createdAt";
        orderDirection = "DESC";
        break;
      case "low_to_high":
        orderField = "price";
        orderDirection = "ASC";
        break;
      case "high_to_low":
        orderField = "price";
        orderDirection = "DESC";
        break;
      default:
        orderField = "createdAt";
        orderDirection = "DESC";
        break;
    }

    // Add filters to the whereCondition object
    if (name) {
      whereCondition.name = name;
    }

    if (brand) {
      whereCondition.brand = brand;
    }

    if (subcategory) {
      whereCondition["$subcategories.subcategory$"] = subcategory;
    }

    if (minPrice && !isNaN(minPrice)) {
      if (!whereCondition.price) {
        whereCondition.price = {};
      }
      whereCondition.price.$gte = Number(minPrice);
    }

    if (maxPrice && !isNaN(maxPrice)) {
      if (!whereCondition.price) {
        whereCondition.price = {};
      }
      whereCondition.price.$lte = Number(maxPrice);
    }

    const getProduct = await categoryModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: productModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          where: whereCondition, // Apply filtering based on search criteria
          include: [
            {
              model: productImgModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: subcategoryModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
              as: "subcategories",
            },
          ],
          order: [[orderField, orderDirection]], // Apply sorting based on 'sort' parameter
        },
      ],
    });

    return res.json(getProduct);

    if (!getProduct || Object.keys(getProduct).length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }
    const formattedProduct = getProduct.products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      discount_price: product.discount_price,
      discount_percentage: product.discount_percentage,
      tag: product.tag,
      stock: product.stock,
      thumbnail: product.thumbnail,
      description: product.description,
      subcategory: product.subcategories.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.subcategory,
      })),
      category: getProduct.name,
      product_images: product.product_images.map((image) => image.images),
    }));

    if (!getProduct) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }
    const totalCount = await productModel.count();
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
      success: true,
      products: getProduct,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
