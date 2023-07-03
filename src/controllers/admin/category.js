const {
  categoryModel,
  productModel,
  productImgModel,
} = require("../../models/models");
const customErrorHandler = require("../../../config/errorHandler");
const { Op } = require("sequelize");

// admin
exports.createCategory = async (req, res, next) => {
  const name = req.body.name;
  console.log(name);
  if (!name) {
    return res
      .status(400)
      .json({ status: false, message: "category is required" });
  }
  try {
    // check category exist in database
    const check_category = await categoryModel.findAll({
      where: { name: name },
    });
    if (!check_category) {
      return res
        .status(400)
        .json({ status: false, message: "category is already exist " });
    }

    const category = await categoryModel.create({ name: name });
    if (!category) {
      return res
        .status(400)
        .json({ status: false, message: "category created failed" });
    }
    return res.status(201).json({
      status: true,
      message: "category created",
      categoryId: category.id,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// admin
exports.updateCategory = async (req, res, next) => {
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
    if (!update_category) {
      return res.status(400).json({ status: false, message: "Update failed" });
    }
    return res.status.json({ status: true, message: "Update successfully" });
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
