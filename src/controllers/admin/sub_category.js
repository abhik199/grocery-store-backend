const path = require("path");
const fs = require("fs");
const joi = require("joi");

const {
  subcategoryModel,
  categoryModel,
  categorySUbCategoryModels,
} = require("../../models/models");

exports.createSubcategory = async (req, res, next) => {
  const subcategorySchema = joi.object({
    categoryId: joi.number().required(),
    subcategory: joi.string().required(),
  });
  const { error } = subcategorySchema.validate(req.body);

  if (error) {
    return next(error);
  }
  //  Duplicate Sub category Id not required

  // const sub_category = await subcategoryModel.findAll({
  //   where: {
  //     subcategory: req.body.subcategory,
  //   },
  // });

  // if (sub_category.length !== 0) {
  //   return res
  //     .status(400)
  //     .json({ status: false, message: "sub category already exist" });
  // }
  const category_id = await categoryModel.findAll({
    where: { id: req.body.categoryId },
  });

  if (category_id.length === 0) {
    return res
      .status(400)
      .json({ status: false, message: "category not valid" });
  }

  try {
    const add_subCategory = await subcategoryModel.create({
      subcategory: req.body.subcategory,
      categoryId: req.body.categoryId,
    });
    if (!add_subCategory || add_subCategory.length === 0) {
      res.status(400).json({
        status: false,
        message: "SubCategory create failed",
      });
    }
    res.status(201).json({
      status: true,
      message: "sub category create successfully",
    });
    await categorySUbCategoryModels.create({
      categoryId: req.body.categoryId,
      subcategoryId: add_subCategory.id,
    });

    const subcategoryCount = await subcategoryModel.count({
      where: { categoryId: req.body.categoryId },
    });

    await categoryModel.update(
      { items: subcategoryCount },
      { where: { id: req.body.categoryId }, returning: true }
    );

    // Image Upload
    if (req.file !== undefined) {
      const image_url = `${req.file.filename}`;
      try {
        await subcategoryModel.update(
          {
            subcategory_images: image_url,
          },
          {
            where: {
              id: add_subCategory.id,
            },
            returning: true,
          }
        );
      } catch (error) {
        const folderPath = path.join(process.cwd(), "public/subcategory");
        const filePath = path.join(folderPath, image_url);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};

exports.fetchSubCategoryByAdmin = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};

exports.deleteSubCategory = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};

exports.updateSubCategory = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};
