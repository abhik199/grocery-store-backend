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
    // const categoryId = category.map((data) => {
    //   return data.id;
    // });
    // for (let i = 0; i < categoryId.length; i++) {
    //   const subcategoryId = parseInt(categoryId[i]); // Convert each ID to an integer

    //   const countItem = await subcategoryModel.count({
    //     where: { categoryId: categoryId },
    //   });
    // }
    // // const countItem = await subcategoryModel.count({
    // //   where: { categoryId: category.id },
    // // });
    // // console.log(category);

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

    const whereCondition = {
      ...(name && { name: { [Op.like]: `%${name}%` } }),
      ...(subcategory && { subcategory: { [Op.like]: `%${subcategory}%` } }),
      ...(brand && { brand: { [Op.like]: `%${brand}%` } }),
      ...(minPrice &&
        maxPrice && {
          [Op.or]: [{ price: { [Op.between]: [minPrice, maxPrice] } }],
        }),
      ...(minPrice &&
        !maxPrice && {
          [Op.or]: [{ price: { [Op.gte]: minPrice } }],
        }),
      ...(maxPrice &&
        !minPrice && {
          [Op.or]: [{ price: { [Op.lte]: maxPrice } }],
        }),
    };
    let order;
    if (sort === "low_to_high") {
      order = [["price", "ASC"]];
    } else if (sort === "high_to_low") {
      order = [["price", "DESC"]];
    } else {
      order = [["createdAt", "DESC"]];
    }

    let orderBy;
    if (sort === "low_to_high") {
      orderBy = [["price", "ASC"]];
    } else if (sort === "high_to_low") {
      orderBy = [["price", "DESC"]];
    } else {
      orderBy = [["createdAt", "DESC"]];
    }

    const getProduct = await categoryModel.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: productModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: productImgModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },

            {
              model: subcategoryModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: reviews_ratingModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
              as: "review",
            },
          ],
        },
      ],
    });

    if (!getProduct || Object.keys(getProduct).length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    // This code is not using at time using fronted side
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
      products: formattedProduct,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};

// Implement  Search app
// for testing Code
// fetchAllProductByCategoryId

exports.fetchAllProductByCategoryId = async (req, res, next) => {
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
        .json({ status: false, message: "Category ID is incorrect" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const { name, brand, subcategory, minPrice, maxPrice, sort } = req.query;

    const whereCondition = {
      ...(name && { name: { [Op.like]: `%${name}%` } }),
      ...(subcategory && { subcategory: { [Op.like]: `%${subcategory}%` } }),
      ...(brand && { brand: { [Op.like]: `%${brand}%` } }),
      ...(minPrice && { price: { [Op.gte]: minPrice } }),
      ...(maxPrice && { price: { [Op.lte]: maxPrice } }),
    };

    let orderBy;
    if (sort === "low_to_high") {
      orderBy = [["price", "ASC"]];
    } else if (sort === "high_to_low") {
      orderBy = [["price", "DESC"]];
    } else {
      orderBy = [["createdAt", "DESC"]];
    }

    const category = await categoryModel.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }

    const productIds = await categoryModel.findAll({
      where: { id: category.id },
      attributes: ["productId"], // Change the column name to "productId"
      raw: true,
    });

    const productIdsArray = productIds.map((item) => item.productId);

    const getProduct = await productModel.findAll({
      where: {
        id: productIdsArray,
        ...whereCondition,
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: productImgModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: subcategoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: reviews_ratingModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          as: "review",
        },
      ],
      order: orderBy,
      offset,
      limit,
    });

    if (!getProduct || getProduct.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Products not found" });
    }

    const formattedProducts = getProduct.map((product) => ({
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
      category: category.name,
      product_images: product.product_images.map((image) => image.images),
    }));

    const totalCount = await productModel.count({
      where: {
        id: productIdsArray,
        ...whereCondition,
      },
    });
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      products: formattedProducts,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};
