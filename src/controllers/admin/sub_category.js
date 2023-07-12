const { subcategoryModel, categoryModel } = require("../../models/models");
const path = require("path");
const fs = require("fs");

exports.createSubcategory = async (req, res, next) => {
  const { categoryId, subcategory } = req.body;
  const sub_category = await subcategoryModel.findAll({
    where: {
      subcategory: subcategory,
    },
  });

  if (sub_category.length !== 0) {
    return res
      .status(400)
      .json({ status: false, message: "sub category already exist" });
  }
  const category_id = await categoryModel.findAll({
    where: { id: categoryId },
  });

  if (category_id.length === 0) {
    return res
      .status(400)
      .json({ status: false, message: "category not valid" });
  }

  try {
    const add_subCategory = await subcategoryModel.create({
      subcategory: subcategory,
      categoryId: categoryId,
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
