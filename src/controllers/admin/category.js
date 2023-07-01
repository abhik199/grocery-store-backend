const { categoryModel, productModel } = require("../../models/models");
const customErrorHandler = require("../../../config/errorHandler");

exports.createCategory = async (req, res, next) => {
  const { name } = req.body;
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
      status: false,
      message: "category created",
      categoryId: category.id,
    });
  } catch (error) {
    return next(error);
  }
};
exports.updateCategory = async (req, res, next) => {
  const { id } = req.params;
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
    res.send(update_category);
    console.log(update_category);
  } catch (error) {
    return next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
  } catch (error) {
    return next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await categoryModel.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!category && !category.length > 1) {
      return res
        .status(400)
        .json({ status: false, message: "category not found" });
    }
    return res.status(200).json({ status: false, data: category });
  } catch (error) {
    return next(error);
  }
};

exports.productSearchByCategory = async (req, res, next) => {
  if (!req.query.query) {
    return res
      .status(400)
      .json({ status: false, message: "query is required" });
  }
  try {
    const category = await categoryModel.findOne({
      where: { name: req.query.query },
    });
    if (!category || category.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Category not found" });
    }
    // Check product base on id

    const product = await productModel.findAll({
      where: { categoryId: category.id },
      include: {
        model: categoryModel,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    });
    if (!product || product.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Products found", product });
  } catch (error) {
    return next(error);
  }
};
