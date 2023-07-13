const { Op } = require("sequelize");
const joi = require("joi");
const env = require("../../../config/env/development");
const {
  categoryModel,
  productModel,
  productImgModel,
  subcategoryModel,
  reviews_ratingModel,
} = require("../../models/models");

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
      items: 10,
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
    const { name } = req.query;

    const whereCondition = {};
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
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
          ],
        },
        {
          model: subcategoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        // reviews and rating not working
        {
          model: reviews_ratingModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!getProduct) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: getProduct,
    });
  } catch (error) {
    return next(error);
  }
};
