const { categoryModel } = require("../../models/models");

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
    return res
      .status(201)
      .json({ status: false, message: "category created " });
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
