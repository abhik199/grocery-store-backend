const path = require("path");
const fs = require("fs");
const joi = require("joi");

const {
  subcategoryModel,
  categoryModel,
  categorySUbCategoryModels,
  productCategoryModels,
  productSubCategoryModels,
  productImgModel,
  productModel,
  orderModel,
} = require("../../models/models");
const { Op } = require("sequelize");

exports.createSubcategory = async (req, res, next) => {
  const subcategorySchema = joi.object({
    categoryId: joi.number().required(),
    subcategory: joi.string().required(),
  });
  const { error } = subcategorySchema.validate(req.body);

  if (error) {
    return next(error);
  }
  const sub_category = await subcategoryModel.findAll({
    where: {
      subcategory: req.body.subcategory,
    },
  });

  if (sub_category.length !== 0) {
    return res
      .status(400)
      .json({ status: false, message: "Duplicate subcategory is not allowed" });
  }
  const category_id = await categoryModel.findAll({
    where: { id: req.body.categoryId },
  });

  if (category_id.length === 0) {
    return res.status(400).json({ status: false, message: "Invalid category" });
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const { subcategory, id } = req.query;
    const whereCondition = {};
    if (subcategory && id) {
      whereCondition[Op.and] = [
        { subcategory: { [Op.like]: `%${subcategory}%` } },
        { id: { [Op.eq]: id } },
      ];
    } else if (subcategory) {
      whereCondition.subcategory = { [Op.like]: `%${subcategory}%` };
    } else if (id) {
      whereCondition.id = { [Op.eq]: id };
    }
    const sub_category = await subcategoryModel.findAll({
      where: {
        status: "active",
      },
      attributes: { exclude: ["createdAt", "updatedAt", "status", "items"] },
      offset: offset,
      limit: limit,
    });
    if (sub_category.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "subcategory not found" });
    }
    const totalCount = await subcategoryModel.count();
    const totalPages = Math.ceil(totalCount / limit);
    return res.status(200).json({
      status: true,
      subcategory: sub_category,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};
// fetch Category by Id only access admin
exports.fetchSubCategoryById = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }
  try {
    const subcategoryId = await subcategoryModel.findOne({
      where: {
        id: id,
      },
    });
    if (!subcategoryId) {
      return res
        .status(404)
        .json({ status: false, message: "subcategory  id wrong" });
    }
    const subcategory = await subcategoryModel.findOne({
      where: {
        status: "active",
        id: subcategoryId.id,
      },
      attributes: { exclude: ["createdAt", "updatedAt", "status", "items"] },
    });

    if (!subcategory) {
      return res
        .status(404)
        .json({ status: false, message: "Subcategory not found" });
    }

    return res.status(200).json({ status: true, subcategory });
  } catch (error) {
    return next(error);
  }
};

exports.updateSubCategory = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "id required" });
  }
  try {
    const subcategoryId = await subcategoryModel.findOne({
      where: {
        status: "active",
        id: id,
      },
    });
    if (!subcategoryId) {
      return res.status(400).json({ status: "subcategory id not found" });
    }
    const subcategory = await subcategoryModel.update(
      {
        subcategory: req.body.subcategory,
      },
      { where: { id: id }, returning: true }
    );
    // Image Upload
    if (req.file !== undefined && !req.file.length > 0) {
      const image_url = `${req.file.filename}`;
      try {
        await subcategoryModel.update(
          {
            subcategory_images: image_url,
          },
          {
            where: {
              id: subcategoryId.id,
            },
            returning: true,
          }
        );
        return res
          .status(200)
          .json({ status: true, message: "update successfully" });
      } catch (error) {
        console.log(error);
      }
    }
    if (!subcategory) {
      return res.status(400).json({ status: false, message: "updated failed" });
    }
    return res
      .status(200)
      .json({ status: true, message: "update successfully" });
  } catch (error) {
    return next(error);
  }
};
exports.deleteSubCategory = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ status: false, message: "Id required" });
  }
  try {
    const subcategoryId = await subcategoryModel.findOne({ where: { id: id } });
    if (!subcategoryId) {
      return res
        .status(404)
        .json({ status: false, message: "subcategory not found" });
    }
    const subcategory = await subcategoryModel.findOne({
      where: { id: subcategoryId.id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: productModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: [
            {
              model: subcategoryId,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
          include: [
            {
              model: productImgModel,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
    });
    if (subcategory.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "subcategory not found" });
    }
    const modifiedData = {
      id: subcategory.id,
      subcategory_images: subcategory.subcategory_images,
      products: subcategory.products.flatMap((product) => product.id),
      images: subcategory.products.flatMap((product) =>
        product.product_images.map((image) => image.images)
      ),
    };
    if (
      subcategory &&
      subcategory.products &&
      subcategory.products.length > 0
    ) {
      // delete  product images
      const productIds = modifiedData.products.map((ids) => {
        return ids;
      });
      for (const productId of productIds) {
        console.log(productId);
        await productImgModel.destroy({ where: { productId } });
      }
      await categorySUbCategoryModels.destroy({
        where: { subcategoryId: modifiedData.id },
      });

      // delete products
      const productsIds = await productSubCategoryModels.findAll({
        where: { subcategoryId: modifiedData.id },
      });
      const productId = productsIds.map((ids) => ids.productId);

      if (productId.length > 1) {
        await productSubCategoryModels.destroy({
          where: { subcategoryId: modifiedData.id },
        });
      }
      for (const productId of productIds) {
        await productSubCategoryModels.destroy({
          where: { productId: productId },
        });
        await productModel.destroy({ where: { id: productId } });
        await productCategoryModels.destroy({
          where: { productId: productId },
        });
        // await orderModel.destroy({ where: { productId: productId } });
      }
      const deleteSubCategory = await subcategoryModel.destroy({
        where: { id: modifiedData.id },
      });

      if (!deleteSubCategory) {
        return res
          .status(400)
          .json({ status: false, message: "Delete failed" });
      }
      return res
        .status(200)
        .json({ status: false, message: "subcategory delete" });
    } else {
      // If there are no products or the subcategory is empty, respond with the subcategory data
      await categorySUbCategoryModels.destroy({
        where: { subcategoryId: modifiedData.id },
      });
      // delete
      await productSubCategoryModels.destroy({
        where: { subcategoryId: modifiedData.id },
      });
      const deleteSubCategory = await subcategoryModel.destroy({
        where: { id: modifiedData.id },
      });

      if (!deleteSubCategory) {
        return res
          .status(400)
          .json({ status: false, message: "Delete failed" });
      }

      // todo delete images in locally
      return res
        .status(200)
        .json({ status: true, message: "subcategory delete" });
    }
  } catch (error) {
    return next(error);
  }
};

exports.fetchSubCategoryByCategoryId = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "Category id required" });
  }
  try {
    const categoryId = await categoryModel.findOne({
      where: { id: id },
    });
    if (!categoryId) {
      return res
        .status(400)
        .json({ status: false, message: "category id wrong" });
    }
    const subcategory = await subcategoryModel.findAll({
      where: { categoryId: categoryId.id },
      attributes: {
        exclude: ["createdAt", "updatedAt", "subcategory_images", "items"],
      },
    });
    if (subcategory.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "subcategory not found" });
    }
    return res.status(200).json({ status: true, subcategory });
  } catch (error) {
    return next(error);
  }
};

// testing code  for count product items
