const {
  categoryModel,
  productModel,
  productImgModel,
} = require("../../models/models");

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
    return res.status(200).json({ status: true, data: category });
  } catch (error) {
    return next(error);
  }
};

// user
exports.getProductByCategory = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ status: false, message: "id required" });
  }

  try {
    const categoryId = await categoryModel.findOne({});
    const category = await categoryModel.findByPk(id, {
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
          ],
        },
      ],
    });

    if (!category) {
      return;
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      category,
    });
  } catch (error) {
    return next(error);
  }
};
