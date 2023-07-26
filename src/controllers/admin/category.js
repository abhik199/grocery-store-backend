const {
  categoryModel,
  productModel,
  productImgModel,
  subcategoryModel,
  productCategoryModels,
  productSubCategoryModels,
  categorySUbCategoryModels,
} = require("../../models/models");
const customErrorHandler = require("../../../config/errorHandler");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const joi = require("joi");

// imageDelete Functions
function imageDelete(image_url) {
  const folderPath = path.join(process.cwd(), "public/category");
  const filePath = path.join(folderPath, image_url);
  fs.unlink(filePath, (error) => {
    if (error) {
      console.log(`Failed to delete: ${error.message}`);
    }
  });
}

// create Category for admin panel
exports.createCategory = async (req, res, next) => {
  const categorySchema = joi.object({
    name: joi.string().required(),
    accessToken: joi.string().optional(),
  });
  console.log(req.body);

  const { error } = categorySchema.validate(req.body);
  if (error) {
    return next(error);
  }
  // Image Delete Function

  try {
    const category = await categoryModel.findAll({
      where: {
        name: req.body.name,
      },
    });

    if (category.length !== 0) {
      return res.status(400).json({
        status: false,
        message: "Duplicate category is not allowed",
      });
    }

    const insertCategory = await categoryModel.create({ name: req.body.name });
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
        console.log(error);
      }
    }
  } catch (error) {
    return next(error);
  }
};

// Update Category for admin panel
exports.updateCategory = async (req, res, next) => {
  const categorySchema = joi.object({
    id: joi.number().required(),
  });
  const { error } = categorySchema.validate(req.params);
  if (error) {
    return next(error);
  }
  const id = req.params.id;
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
      try {
        const category_image = await categoryModel.update(
          {
            category_images: req.file.filename,
          },
          { where: { id: id }, returning: true }
        );
        if (!category_image) {
          return res
            .status(400)
            .json({ status: false, message: "Update failed" });
        }

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

exports.fetchAllCategoryByAmin = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const { name, id } = req.query;
    const whereCondition = {};
    if (name && id) {
      whereCondition[Op.and] = [
        { name: { [Op.like]: `%${name}%` } },
        { id: { [Op.eq]: id } },
      ];
    } else if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    } else if (id) {
      whereCondition.id = { [Op.eq]: id };
    }

    const category = await categoryModel.findAll({
      where: {
        status: "active",
        [Op.and]: whereCondition,
      },
      attributes: { exclude: ["createdAt", "updatedAt", "items", "status"] },
      offset: offset,
      limit: limit,
    });

    if (!category && !category.length > 1) {
      return res
        .status(400)
        .json({ status: false, message: "category not found" });
    }
    const totalCount = await categoryModel.count({
      where: { status: "active" },
    });
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

exports.fetchCategoryById = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ status: false, message: "id required" });
  }
  try {
    const category = await categoryModel.findOne({
      where: {
        status: "active",
        id: id,
      },
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

// Delete Category  For Admin Panel
// image Delete , subcategory, products , all images delete

exports.deleteCategory = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(200).json({ status: false, message: "Id required" });
  }

  try {
    const categoryId = await categoryModel.findOne({
      where: {
        status: "active",
        id: id,
      },
    });
    if (!categoryId) {
      return res
        .status(400)
        .json({ status: false, message: "category not found" });
    }
    const product = await categoryModel.findOne({
      where: { id: req.params.id },
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
              model: productImgModel,
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: subcategoryModel, // Include the subcategory model
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
        },
      ],
    });

    if (product.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }

    const modifiedData = {
      category: product.name,
      id: product.id,
      status: product.status,
      category_images: product.category_images,
      products: product.products.flatMap((product) => product.id),
      subcategories: product.products.flatMap((product) => {
        return product.subcategories.map((subcategory) => ({
          id: subcategory.id,
          subcategory_images: subcategory.subcategory_images,
        }));
      }),
      images: product.products.flatMap((product) =>
        product.product_images.map((image) => image.images)
      ),
    };

    if (modifiedData.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "product not found" });
    }

    try {
      // delete product image
      const productImages = modifiedData.images.map((data) => {
        return data;
      });

      const fileNames = productImages.map((imageUrl) => {
        return imageUrl;
      });
      const folderPath = path.join(process.cwd(), "public/product"); // Adjust

      fileNames.forEach((fileName) => {
        const filePath = path.join(folderPath, fileName);

        fs.unlink(filePath, (error) => {
          if (error) {
            return next(error);
          }
        });
      });

      const productIds = modifiedData.products.map((ids) => ids);

      // Deleting product images
      for (const productId of productIds) {
        await productImgModel.destroy({ where: { productId } });
      }

      // Deleting category and subcategory associations
      // working

      await categorySUbCategoryModels.destroy({
        where: { categoryId: req.params.id },
      });

      // Deleting associations between products and subcategories
      // working
      for (const productId of productIds) {
        console.log(productId);
        await productSubCategoryModels.destroy({ where: { productId } });
      }

      // Deleting associations between categories and products
      await productCategoryModels.destroy({
        where: { categoryId: req.params.id },
      });

      // Deleting products
      for (const productId of productIds) {
        await productModel.destroy({ where: { id: productId } });
      }
      // deleting images and data in database for subcategory
      const sub = modifiedData.subcategories.map((sub) => {
        return { id: sub.id, subcategory_images: sub.subcategory_images };
      });
      const ids = sub.map((sub) => sub.id);
      const subcategoryImages = sub.map((sub) => sub.subcategory_images);

      // delete images in locally
      const fileName = subcategoryImages.map((imageUrl) => {
        return imageUrl;
      });
      const fol_path = path.join(process.cwd(), "public/subcategory"); // Adjust

      fileNames.forEach((fileName) => {
        const filePath = path.join(fol_path, fileName);

        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(error);
          }
        });
      });
      await subcategoryModel.destroy({ where: { categoryId: req.params.id } });

      // delete category images and data in database

      // const folder_path = path.join(process.cwd(), "public/category");

      const delete_category = await categoryModel.destroy({
        where: { id: req.params.id },
      });
      if (!delete_category) {
        return res.status(400).json({ status: false, message: "Failed" });
      }
      return res
        .status(200)
        .json({ status: true, message: "Category delete successfully" });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    return next(error);
  }
};

// exports.deleteCategory = async (req, res, next) => {
//   const id = req.params.id;
//   if (!id) {
//     return res.status(200).json({ status: false, message: "Id required" });
//   }
//   try {
//     const categoryId = await categoryModel.findOne({
//       where: {
//         // status: "active",
//         id: id,
//       },
//     });
//     if (!categoryId) {
//       return res
//         .status(400)
//         .json({ status: false, message: "category Id not found" });
//     }
//     const product = await categoryModel.findOne({
//       where: { id: categoryId },
//       attributes: {
//         exclude: ["createdAt", "updatedAt"],
//       },
//       include: [
//         {
//           model: productModel,
//           attributes: {
//             exclude: ["createdAt", "updatedAt"],
//           },
//           include: [
//             {
//               model: productImgModel,
//               attributes: {
//                 exclude: ["createdAt", "updatedAt"],
//               },
//             },
//             {
//               model: subcategoryModel, // Include the subcategory model
//               attributes: {
//                 exclude: ["createdAt", "updatedAt"],
//               },
//             },
//           ],
//         },
//       ],
//     });
//     res.send(product);
//   } catch (error) {
//     return next(error);
//   }
// };
