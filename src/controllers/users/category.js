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

// user
exports.fetchAllByCategoryId = async (req, res, next) => {
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

    const { subcategory, name, brand, minPrice, maxPrice, sort } = req.query;

    const whereCondition = {
      ...(subcategory && { subcategory: { [Op.like]: `%${subcategory}%` } }),
      ...(name && { name: { [Op.like]: `%${name}%` } }),
      ...(brand && { brand: { [Op.like]: `%${brand}%` } }),
      ...(minPrice && { price: { [Op.gte]: minPrice } }),
      ...(maxPrice && { price: { [Op.lte]: maxPrice } }),
    };

    const order = [];
    if (sort === "low_to_high") {
      order.push(["price", "ASC"]);
    } else if (sort === "high_to_low") {
      order.push(["price", "DESC"]);
    } else {
      order.push(["createdAt", "DESC"]);
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
            // {
            //   model: reviews_ratingModel,
            //   attributes: { exclude: ["createdAt", "updatedAt"] },
            //   as: "review",
            // },
          ],
          where: whereCondition,
          order,
          limit,
        },
      ],
    });

    if (!getProduct || getProduct.products.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Products not found" });
    }

    const formattedProducts = getProduct.products.map((product) => ({
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
      subcategory: product.subcategories.map(
        (subcategory) => subcategory.subcategory
      ),
      category: getProduct.name,
      product_images: product.product_images.map((image) => image.images),
    }));

    const totalCount = await productModel.count({ where: whereCondition });
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
