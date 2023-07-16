const {
  productModel,
  productImgModel,
  categoryModel,
  reviews_ratingModel,
  subcategoryModel,
  orderModel,
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
    const { category } = req.query;

    const whereCondition = {};

    const { count, rows: products } = await productModel.findAndCountAll({
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
          model: productImgModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: subcategoryModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      limit: 10,
    });

    if (count === 0) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }
    const modifiedProduct = products.map((product) => ({
      id: product.id,
      title: product.name,
      brand: product.brand,
      price: product.price,
      discount_price: product.discount_price,
      tag: product.tag,
      subcategory: product.subcategories.map(
        (subcategory) => subcategory.subcategory
      ),
      image: product.product_images.map((image) => image.images).slice(0, 2),
    }));

    return res.status(200).json({
      status: true,
      data: modifiedProduct,
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
      where: { id: id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },

      include: [
        {
          model: reviews_ratingModel, // Change the model name to "reviews_ratingModel"
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          as: "review", // Use the original alias "reviews_and_ratings"
        },
        // {
        //   model: categoryModel,
        //   attributes: {
        //     exclude: ["createdAt", "updatedAt"],
        //   },
        //   as: "categories", // Specify the alias used for the category association
        //   through: { attributes: [] }, // Exclude the join table attributes
        // },
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

exports.fetchAllPopularProduct = async (req, res, next) => {
  // Product Filter by subcategory
  const { subcategory } = req.query;
  try {
    const popular_productIds = await orderModel.findAll({
      where: { status: "Delivered" },
    });
    const productIds = popular_productIds.map((order) => order.productId);

    let productFilter = {
      where: { id: productIds },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: subcategoryModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          through: { attributes: [] }, // Exclude join table attributes
        },
        {
          model: productImgModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
      limit: 10,
    };

    if (subcategory) {
      productFilter.include[0].where = { subcategory: subcategory };
    }

    const products = await productModel.findAll(productFilter);

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Products not found" });
    }

    const modifiedProducts = products.map((product) => ({
      id: product.id,
      title: product.name,
      brand: product.brand,
      price: product.price,
      discount_price: product.discount_price,
      tag: product.tag,
      subcategories: product.subcategories.map(
        (subcategory) => subcategory.subcategory
      ),
      images: product.product_images.map((image) => image.images),
    }));

    return res.status(200).json({
      status: true,
      products: modifiedProducts,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllBestSellsProduct = async (req, res, next) => {
  // filter product
  try {
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllDealsOfDayProduct = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllTopSellingProduct = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllTrendingProduct = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllRecentlyAddedProduct = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};
