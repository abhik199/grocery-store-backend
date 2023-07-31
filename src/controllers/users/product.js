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
    if (!product && product === 0) {
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
  try {
    const { subcategory } = req.query;
    const popularProducts = await orderModel.findAll({
      attributes: [
        "productId",
        [sequelize.fn("COUNT", sequelize.col("productId")), "order_count"],
      ],
      group: ["productId"],
      order: [[sequelize.literal("order_count"), "DESC"]],
    });

    let filteredProducts = popularProducts;
    let whereCondition;
    if (subcategory) {
      whereCondition = {
        "$subcategories.subcategory$": {
          [Op.like]: `%${subcategory}%`,
        },
      };
    }
    //

    if (filteredProducts.length > 0) {
      const popularProductsData = [];
      for (const product of filteredProducts) {
        const { productId, order_count } = product.get();
        const getProduct = await productModel.findOne({
          where: { id: productId },
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: subcategoryModel,
              where: whereCondition,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: productImgModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
          ],
        });
        if (!getProduct) {
          // If the product is not found, continue to the next iteration
          res.status(404).json({ status: false, message: "product not found" });
          continue;
        }
        popularProductsData.push(getProduct);
      }
      const modifiedProduct = popularProductsData.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        discount_price: product.discount_price,
        discount_percentage: product.discount_percentage,
        tag: product.tag,
        stock: product.stock,
        description: product.description,
        subcategories: product.subcategories.map((subcategory) => ({
          id: subcategory.id,
          subcategory: subcategory.subcategory,
        })),
        images: product.product_images.slice(0, 2).map((image) => image.images),
      }));
      return res.status(200).json({ status: true, products: modifiedProduct });
    } else {
      console.log("No orders found in the database.");
      return res
        .status(404)
        .json({ status: false, message: "No popular products found" });
    }
  } catch (error) {
    return next(error);
  }
};

exports.fetchDailyBestSellsProduct = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const getOrder = await orderModel.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lte]: today,
        },
      },
    });

    // Create an object to keep track of the number of orders for each product
    const productCounts = {};

    getOrder.forEach((order) => {
      const productId = order.productId;
      // Increment the count for the product
      if (productCounts[productId]) {
        productCounts[productId]++;
      } else {
        productCounts[productId] = 1;
      }
    });
    const BestSellProduct = Object.keys(productCounts);

    let products = [];
    for (const productId of BestSellProduct) {
      const foundProduct = await productModel.findAll({
        where: { id: productId },
        attributes: { exclude: ["createdAt", "updatedAt", "status"] },
      });
      products.push(...foundProduct);
    }
    if (products.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No best-selling product found for today",
      });
    }
    return res.status(200).json({ status: true, products });
  } catch (error) {
    console.log(error);
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
