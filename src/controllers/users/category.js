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
      category_images: `${env.url}/category/${cat.category_images}`,
      items: cat.items,
    }));

    return res.status(200).json({ status: true, data: modifiedCategory });
  } catch (error) {
    return next(error);
  }
};

// user
exports.fetchAllByCategoryId = async (req, res, next) => {
  // get sub category
  const idSchema = joi.object({
    id: joi.number().required(),
  });
  const { error } = idSchema.validate(req.params);
  if (error) {
    return next(error);
  }

  try {
    // find category  valid or not
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
    const { name, brand, category, minPrice, maxPrice, sort } = req.query;

    const whereCondition = {};
    if (name) {
      whereCondition.name = {
        [Op.like]: `%${name}%`,
      };
    }
    if (brand) {
      whereCondition.brand = {
        [Op.like]: `%${brand}`,
      };
    }
    // Search by subcategory
    if (category) {
      whereCondition["$subcategories.subcategory$"] = {
        [Op.like]: `%${category}%`,
      };
    }
    // Filter by price
    if (minPrice && maxPrice) {
      whereCondition.price = {
        [Op.between]: [minPrice, maxPrice],
      };
    } else if (minPrice) {
      whereCondition.price = {
        [Op.gte]: minPrice,
      };
    } else if (maxPrice) {
      whereCondition.price = {
        [Op.lte]: maxPrice,
      };
    }
    // Filter by brand
    if (brand) {
      whereCondition.brand = {
        [Op.like]: `%${brand}%`,
      };
    }
    let orderBy;
    if (sort === "low_to_high") {
      console.log(sort);
      orderBy = [["price", "ASC"]];
    } else if (sort === "high_to_low") {
      console.log(sort);
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
              model: subcategoryModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: reviews_ratingModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
              as: "review",
            },
          ],
          where: whereCondition,
          order: orderBy,
        },
      ],
      offset: offset,
      limit: limit,
    });

    // Format the nested subcategories and reviews
    const formattedProduct = getProduct.toJSON();
    formattedProduct.products.forEach((product) => {
      product.subcategories = product.subcategories.map((subcategory) => ({
        id: subcategory.id,
        subcategory: subcategory.subcategory,
        subcategory_images: subcategory.subcategory_images,
        categoryId: subcategory.categoryId,
        items: subcategory.items,
      }));
    });

    if (!getProduct) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }
    const totalCount = await productModel.count();
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: formattedProduct,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};
