const {
  subcategoryModel,
  categoryModel,
  productModel,
} = require("../../models/models");

exports.fetchProductBySubCategoryId = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "sub category id required" });
  }

  try {
    const category_id = await subcategoryModel.findOne({ where: { id: id } });
    if (category_id.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "subcategory id not valid" });
    }
    const getSubCategory = await subcategoryModel.findAll({
      where: { id: id },
      include: [
        {
          model: productModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!getSubCategory) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }
    return res.status(200).json({ getSubCategory });
  } catch (error) {
    return next(error);
  }
};

// browse all categories
exports.fetchAllSubCategory = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "category Id required" });
  }
  try {
    const category_Id = await categoryModel.findOne({ where: { id: id } });
    if (!category_Id) {
      return res
        .status(400)
        .json({ status: false, message: "Category Id not valid" });
    }
    const subcategory = await subcategoryModel.findAll({
      where: {
        categoryId: id,
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!subcategory && subcategory.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Browser category not found" });
    }
    const modifiedCategory = subcategory.map((cat) => {
      return {
        id: cat.id,
        subcategory: cat.subcategory,
        subcategory_images: `http://192.168.1.56:6900/subcategory/${cat.subcategory_images}`,
        items: cat.items,
      };
    });

    return res
      .status(200)
      .json({ status: true, subcategory: modifiedCategory });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllSubCategories = async (req, res, next) => {
  try {
    const subcategory = await subcategoryModel.findAll({
      where: { status: "active" },
      attributes: { exclude: ["createdAt", "updatedAt", "status"] },
    });
    if (subcategory.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "subcategory  not found " });
    }
    return res.status(200).json({ status: true, subcategory });
  } catch (error) {
    return next(error);
  }
};
