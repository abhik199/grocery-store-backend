const {
  categoryModel,
  productModel,
  productImgModel,
  subcategoryModel,
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

exports.fetchCategoryById = async (req, res, next) => {
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

// Delete Category  For Admin Panel
// image Delete , subcategory, products , all images delete

exports.deleteCategory = async (req, res, next) => {
  const categorySchema = joi.object({
    id: joi.number().required(),
  });
  const { error } = categorySchema.validate(req.params);
  if (error) {
    return next(error);
  }

  try {
    const categoryId = await categoryModel.findOne({
      where: { id: req.params.id },
    });
    if (!categoryId) {
      return res.status(400).json({ status: false, message: "Id not valid" });
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
          ],
        },
        {
          model: subcategoryModel,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
      ],
    });

    const modifiedData = {
      category: product.name,
      id: product.id,
      category_images: product.category_images,
      products: product.products.flatMap((product) => product.id),
      subcategories: product.subcategories.map((subcategory) => ({
        id: subcategory.id,
        subcategory_images: subcategory.subcategory_images,
      })),
      images: product.products.flatMap((product) =>
        product.product_images.map((image) => image.images)
      ),
    };

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
            console.log(`Failed to delete ${fileName}: ${error.message}`);
          }
        });
      });

      const productIds = modifiedData.products.map((product) => product.id);

      for (let i = 0; i < productIds.length; i++) {
        const productId = productIds[i];
        // const a = await productModel.destroy({ where: { id: productId } });
        // console.log(a);
        console.log(productId);
      }
    } catch (error) {
      console.log(error);
    }

    // try {
    //   // delete multiple sub category images
    //   const subcategoryImages = await modifiedData.subcategories.map((date) => {
    //     return date.subcategory_images;
    //   });

    //   const fileNames = subcategoryImages.map((imageUrl) => {
    //     return imageUrl;
    //   });
    //   const folderPath = path.join(process.cwd(), "public/subcategory"); // Adjust

    //   fileNames.forEach((fileName) => {
    //     const filePath = path.join(folderPath, fileName);

    //     fs.unlink(filePath, (error) => {
    //       if (error) {
    //         console.log(`Failed to delete ${fileName}: ${error.message}`);
    //       }
    //     });
    //   });
    //   const subcategoryIds = await modifiedData.subcategories.map((data) => {
    //     return data.id;
    //   });
    //   for (let i = 0; i < subcategoryIds.length; i++) {
    //     const productId = subcategoryIds[i];
    //     const a = await subcategoryModel.destroy({
    //       where: { id: subcategoryIds },
    //     });
    //     console.log(a);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
    // try {
    //   // delete category
    //   const folderPath = path.join(process.cwd(), "public/category");
    //   const filePath = path.join(folderPath, categoryId.category_images);
    //   fs.unlink(filePath, (error) => {
    //     if (error) {
    //       console.log(`Failed to delete: ${error.message}`);
    //     }
    //   });
    // } catch (error) {}

    // const category = await categoryModel.destroy({
    //   where: { id: categoryId.id },
    // });
    // if (!category) {
    //   return res.status(400).json({ status: false, message: "Delete failed" });
    // }
    // return res
    //   .status(200)
    //   .json({ status: true, message: "Delete successfully" });
    res.send(modifiedData);
  } catch (error) {
    return next(error);
  }
};
