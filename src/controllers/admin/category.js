const {
  categoryModel,
  productModel,
  productImgModel,
} = require("../../models/models");
const customErrorHandler = require("../../../config/errorHandler");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

// admin
exports.createCategory = async (req, res, next) => {
  try {
    const name = req.body.name;
    if (!name) {
      return next(customErrorHandler.requiredField());
    }
    const insertCategory = await categoryModel.create({ name: name });
    if (!insertCategory || insertCategory.length === 0) {
      res.status(400).json({
        status: false,
        message: "Category create failed",
      });
    }
    res.status(201).json({
      status: true,
      message: "category create successfully",
    });

    // Image Upload
    if (req.file !== undefined && !req.file.length > 0) {
      const image_url = `${req.file.filename}`;
      try {
        await categoryModel.update(
          {
            category_images: image_url,
          },
          {
            where: {
              id: insertCategory.id,
            },
            returning: true,
          }
        );
      } catch (error) {
        const folderPath = path.join(process.cwd(), "public/category");
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

// admin
exports.updateCategory = async (req, res, next) => {
  console.log(req.body);
  const id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "Category id required" });
  }
  try {
    const categoryId = await categoryModel.findOne({ where: { id: id } });
    if (!categoryId) {
      return res.status(400).json({ status: false, message: "Id not valid" });
    }
    const update_category = await categoryModel.update(
      { name: req.body.name },
      { where: { id: id }, returning: true }
    );
    if (req.file !== undefined) {
      const image_url = `${req.file.filename}`;
      try {
        console.log(req.file.filename);
        const a = await categoryModel.update(
          {
            category_images: req.file.filename,
          },
          {
            where: {
              id: update_category.id,
            },
            returning: true,
          }
        );
        console.log(a);
        res.status(200).json({ status: true, message: "Update successfully" });
      } catch (error) {
        const folderPath = path.join(process.cwd(), "public/category");
        const filePath = path.join(folderPath, image_url);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });
      }
    }
    if (!update_category) {
      return res.status(400).json({ status: false, message: "Update failed" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Update successfully" });
  } catch (error) {
    return next(error);
  }
};

// admin

exports.deleteCategory = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }
  try {
    const categoryId = await categoryModel.findOne({ where: { id: id } });
    if (!categoryId) {
      return res.status(400).json({ status: false, message: "Id not valid" });
    }
    const category = await categoryModel.destroy({
      where: { id: categoryId.id },
    });
    if (!category) {
      return res.status(400).json({ status: false, message: "Delete failed" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Delete successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name, id } = req.query;
    const whereCondition = {};
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    if (id) {
      whereCondition.id = { [Op.eq]: id };
    }

    const category = await categoryModel.findAll({
      where: whereCondition,
      attributes: { exclude: ["createdAt", "updatedAt"] },
      offset: offset,
      limit: limit,
    });

    if (!category && !category.length > 1) {
      return res
        .status(400)
        .json({ status: false, message: "category not found" });
    }
    const totalCount = await productModel.count();
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: true,
      data: category,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSingleCategory = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ status: false, message: "id required" });
  }
  try {
    const category = await categoryModel.findOne({
      where: { id: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!category) {
      return res.status(400).json({ status: false, message: "id not valid" });
    }
    return res.status(200).json({ status: true, category });
  } catch (error) {
    return next(error);
  }
};
