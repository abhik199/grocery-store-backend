const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const {
  productModel,
  productImgModel,
  categoryModel,
  productCategoryModels,
  productSubCategoryModels,
  subcategoryModel,
  categorySUbCategoryModels,
  cardModel,
  orderModel,
} = require("../../models/models");
const customErrorHandler = require("../../../config/customErrorHandler");
const joi = require("joi");

exports.createProducts = async (req, res, next) => {
  const productSchema = joi.object({
    name: joi.string().required(),
    price: joi.number().required(),
    brand: joi.string().required(),
    discount_price: joi.number().optional().min(0),
    categoryId: joi.number().required().min(1),
    tag: joi.string().optional(),
    stock: joi.number().required().max(500).min(0),
    subcategoryId: joi.string().required().min(1).max(10),
    description: joi.string().optional().max(250),
    accessToken: joi.string().optional(),
  });
  const { error } = productSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  const { price, discount_price, categoryId, subcategoryId } = req.body;

  try {
    const checkCategoryId = await categoryModel.findOne({
      where: { id: categoryId },
    });

    if (!checkCategoryId) {
      return res
        .status(400)
        .json({ status: false, message: "Category not found" });
    }
    // const subcategories = subcategoryId.split(",");
    // const subcategoryIds = [subcategories];
    const subcategoryIds = subcategoryId.split(",");

    const checkSubcategories = await subcategoryModel.findAll({
      where: { id: subcategoryIds },
    });

    if (checkSubcategories.length !== subcategoryIds.length) {
      return res.status(400).json({
        status: false,
        message: "One or more subcategories not found",
      });
    }

    const isLinked = await categorySUbCategoryModels.findAll({
      where: { categoryId, subcategoryId: subcategoryIds },
    });

    if (isLinked.length !== subcategoryIds.length) {
      return res.status(400).json({
        status: false,
        message: "One or more subcategories are not linked to the category",
      });
    }
    const parsedPrice = parseFloat(price);
    const parsedDiscountPrice = parseFloat(discount_price);
    const discounted_percentage =
      ((parsedPrice - parsedDiscountPrice) / parsedPrice) * 100;
    // check category Id
    // all subcategory linked or not category
    try {
      const product = await productModel.create({
        ...req.body,
        discount_percentage: discounted_percentage,
      });

      if (!product) {
        return res.status(400).json({
          status: false,
          message: "Failed to create product",
        });
      }

      // Create product-category association
      await productCategoryModels.create({
        categoryId: categoryId,
        productId: product.id,
      });

      // Create product-subcategory associations
      const subcategories = subcategoryId.split(",");
      console.log(subcategories);

      for (let i = 0; i < subcategories.length; i++) {
        const subcategoryId = parseInt(subcategories[i]);
        await productSubCategoryModels.create({
          subcategoryId: subcategoryId,
          productId: product.id,
        });
      }

      // count product update sub category items fields
      const productCount = await productSubCategoryModels.findAll({
        where: { productId: product.id },
      });

      if (req.files !== undefined && req.files.length > 0) {
        const imageFiles = req.files;
        try {
          const productImages = [];
          for (let i = 0; i < imageFiles.length; i++) {
            const imagePath = `${imageFiles[i].filename}`;
            await productImgModel.create({
              productId: product.id,
              images: imagePath,
            });
            productImages.push(imagePath);
          }
          await productModel.update(
            {
              thumbnail: productImages[0],
            },
            { where: { id: product.id }, returning: true }
          );
        } catch (error) {
          const fileNames = imageFiles.map((img) => {
            return img;
          });
          const folderPath = path.join(process.cwd(), "public/product");
          fileNames.forEach((fileName) => {
            const filePath = path.join(folderPath, fileName);
            fs.unlink(filePath, (error) => {
              if (error) {
                console.log(`Failed to delete: ${error.message}`);
              }
            });
          });
        }
      }

      res.status(201).json({
        status: true,
        message: "Product created successfully",
        product: product,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Failed to create product",
      });
    }

    res.status(201).json({
      status: true,
      message: "Product created successfully",
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllProducts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name } = req.query;

    const whereCondition = {};

    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }

    const products = await productModel.findAll({
      where: whereCondition,
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: productImgModel,
          attributes: {
            exclude: ["createdAt", "updatedAt", "product_category"],
          },
        },
        {
          model: categoryModel,
          attributes: {
            exclude: ["createdAt", "updatedAt", "product_category"],
          },
        },
        {
          model: subcategoryModel,
          attributes: {
            exclude: ["createdAt", "updatedAt", "product_category"],
          },
        },
      ],
      offset: offset,
      limit: limit,
    });

    const totalCount = await productModel.count();

    if (products === 0) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }
    const modifiedProduct = products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      discount_price: product.discount_price,
      discount_percentage: product.discounted_percentage,
      tag: product.tag,
      stock: product.stock,
      thumbnail: product.thumbnail,
      description: product.description,
      categories: product.categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
      subcategories: product.subcategories.map((subcategory) => ({
        id: subcategory.id,
        subcategory: subcategory.subcategory,
      })),
      product_images: product.product_images.map((images) => ({
        id: images.id,
        images: images.images,
      })),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully.",
      data: modifiedProduct,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchProductById = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "product id required" });
  }

  try {
    const productIs = await productModel.findOne({
      where: { id: req.params.id },
    });
    if (!productIs) {
      return res
        .status(400)
        .json({ status: false, message: "product id not found" });
    }
    const product = await productModel.findOne({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      where: { id: id },
      include: [
        {
          model: productImgModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: subcategoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!product && product.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "product not found" });
    }
    const modifiedProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      discount_price: product.discount_price,
      discount_percentage: product.discount_percentage,
      tag: product.tag,
      stock: product.stock,
      thumbnail: product.thumbnail,
      description: product.description,
      categories: product.categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
      subcategories: product.subcategories.map((subcategory) => ({
        id: subcategory.id,
        subcategory: subcategory.subcategory,
      })),
      product_images: product.product_images.map((image) => ({
        id: image.id,
        images: image.images,
      })),
    };
    return res.status(200).json({ status: true, product: modifiedProduct });
  } catch (error) {
    return next(error);
  }
};

// delete product it working

exports.deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "product id required" });
  }
  try {
    // delete in locally
    const productId = await productModel.findOne({ where: { id: id } });
    if (!productId) {
      return res
        .status(400)
        .json({ status: false, message: "Product not found" });
    }
    // product images delete
    const findImg = await productImgModel.findAll({
      where: { productId: productId.id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    // remove Associations between category and subcategory or subcategory and category
    await productCategoryModels.destroy({
      where: { productId: id },
    });
    await productSubCategoryModels.destroy({ where: { productId: id } });
    if (findImg.length === 0 && String(productId.id)) {
      const delete_img = await productModel.destroy({ where: { id: id } });
      if (!delete_img) {
        return res
          .status(400)
          .json({ status: false, message: "Failed to delete" });
      }
      return res
        .status(200)
        .json({ status: true, message: "delete successfully" });
    }
    const fileNames = findImg.map((img) => {
      return img.images;
    });
    console.log(fileNames);
    const folderPath = path.join(process.cwd(), "public/product");
    fileNames.forEach((fileName) => {
      const filePath = path.join(folderPath, fileName);
      fs.unlink(filePath, (error) => {
        if (error) {
          console.log(`Failed to delete: ${error.message}`);
        }
      });
    });
    // delete image in database
    await productImgModel.destroy({ where: { productId: id } });
    // delete  product
    const delete_product = await productModel.destroy({ where: { id: id } });

    if (!delete_product) {
      return res
        .status(400)
        .json({ status: false, message: "Product Delete failed" });
    }
    // await cardModel.destroy({ where: { productId: req.params.id } });
    // await orderModel.destroy({ where: { productId: req.params.id } });
    return res
      .status(200)
      .json({ status: true, message: "Product Delete successfully" });
  } catch (error) {
    return next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "product id required" });
  }
  const { price, discount_price, categoryId, subcategoryId } = req.body;
  if (!categoryId || !subcategoryId) {
    return res.status(400).json({
      status: false,
      message: "category and subcategory Id required field ",
    });
  }
  try {
    const checkCategoryId = await categoryModel.findOne({
      where: { id: categoryId },
    });

    if (!checkCategoryId) {
      return res
        .status(400)
        .json({ status: false, message: "Category not found" });
    }
    const subcategoryIds = subcategoryId.split(",");

    const checkSubcategories = await subcategoryModel.findAll({
      where: { id: subcategoryIds },
    });

    if (checkSubcategories.length !== subcategoryIds.length) {
      return res.status(400).json({
        status: false,
        message: "One or more subcategories not found",
      });
    }

    const isLinked = await categorySUbCategoryModels.findAll({
      where: { categoryId, subcategoryId: subcategoryIds },
    });

    if (isLinked.length !== subcategoryIds.length) {
      return res.status(400).json({
        status: false,
        message: "One or more subcategories are not linked to the category",
      });
    }
    const parsedPrice = parseFloat(price);
    const parsedDiscountPrice = parseFloat(discount_price);
    const discounted_percentage =
      ((parsedPrice - parsedDiscountPrice) / parsedPrice) * 100;

    const [count, updatedRows] = await productModel.update(
      { ...req.body, discount_percentage: discounted_percentage },
      { where: { id: id }, returning: true }
    );

    if (count === 0) {
      return res.status(400).json({ status: false, message: "Update failed" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Update successfully" });
  } catch (error) {
    return next(error);
  }
};

// delete product
// as single image delete and multiple image delete

exports.deleteImage = async (req, res, next) => {
  const ids = req.params.ids;
  if (!ids) {
    return res.status(400).json({ status: false, message: "Id required" });
  }
  const imageIds = ids.split("-");
  try {
    const images = await productImgModel.findAll({
      where: {
        id: imageIds,
      },
    });

    const fileUrl = images.map((img) => {
      return img.images;
    });

    const fileNames = fileUrl.map((imageUrl) => {
      return imageUrl;
    });
    console.log(fileNames);
    const folderPath = path.join(process.cwd(), "public/product"); // Adjust

    fileNames.forEach((fileName) => {
      const filePath = path.join(folderPath, fileName);

      fs.unlink(filePath, (error) => {
        if (error) {
          console.log(`Failed to delete ${fileName}: ${error.message}`);
        }
      });
    });

    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "image not found" });
    }
    await productImgModel.destroy({
      where: {
        id: imageIds,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Images deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateImage = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: "Image id required" });
    }
    const findId = await productImgModel.findOne({ where: { id: id } });
    if (!findId) {
      return res
        .status(400)
        .json({ status: false, message: "Image Id not valid" });
    }
    if (req.file !== undefined) {
      const image_id = await productImgModel.findOne({ where: { id: id } });
      console.log(image_id);
      if (!image_id) {
        res.status(400).json({ status: false, message: "image not found" });
        const folderPath = path.join(process.cwd(), "public/product");

        const filePath = path.join(folderPath, req.file.filename);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });
        return;
      }
      // delete image in locally
      const folderPath = path.join(process.cwd(), "public/product");

      const filePath = path.join(folderPath, image_id.images);
      fs.unlink(filePath, (error) => {
        if (error) {
          console.log(`Failed to delete${error.message}`);
        }
      });
      // update in database
      const image_update = await productImgModel.update(
        {
          images: req.file.filename,
        },
        { where: { id: id }, returning: true }
      );
      if (!image_update) {
        return res
          .status(400)
          .json({ status: false, message: "Image update Failed" });
      }
      return res
        .status(200)
        .json({ status: false, message: "image update successfully" });
    }
    return res.status(200).json({ message: "please select product image" });
  } catch (error) {
    const folderPath = path.join(process.cwd(), "public/product");

    const filePath = path.join(folderPath, req.file.filename);
    fs.unlink(filePath, (error) => {
      if (error) {
        console.log(`Failed to delete${error.message}`);
      }
    });
    return next(error);
  }
};
