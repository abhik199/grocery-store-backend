const {
  productModel,
  productImgModel,
  categoryModel,
  productCategory,
} = require("../../models/models");
const customErrorHandler = require("../../../config/customErrorHandler");
const { Op, where } = require("sequelize");
const path = require("path");
const fs = require("fs");

exports.createProducts = async (req, res, next) => {
  const { name, price, brand, discount_price, categoryId, tag, stock } =
    req.body;

  if (!name || !price || !discount_price || !brand || !stock || !categoryId) {
    return next(customErrorHandler.requiredField());
  }

  try {
    const selling_price = price;
    const discounted_price = discount_price;
    const discounted_percentage =
      ((selling_price - discounted_price) / selling_price) * 100;

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

    if (req.files !== undefined) {
      const imageFiles = req.files;

      try {
        const productImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const imagePath = `${imageFiles[i].filename}`;
          await productImgModel.create({
            productId: product.id,
            images: imagePath,
          });
          console.log(imagePath);
          productImages.push(imagePath);
        }

        await product.update(
          {
            thumbnail: productImages[0],
          },
          { where: { id: product.id }, returning: true }
        );
        // add multiple category  in category modules
        const category = [categoryId]; // Assuming you have an array of category IDs

        const product_category = []; // Initialize an empty array outside the loop

        for (let i = 0; i < category.length; i++) {
          const categoryId = category[i];

          try {
            const createdProductCategory = await productCategory.create({
              productId: product.id,
              categoryId: categoryId,
            });

            console.log(createdProductCategory);
            product_category.push(categoryId);
          } catch (error) {
            console.error(
              `Failed to create product category for categoryId: ${categoryId}`,
              error
            );
          }
        }

        console.log(product_category);
      } catch (error) {
        const fileNames = imageFiles.map((img) => {
          return img.filename;
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

    const { count, rows: products } = await productModel.findAndCountAll({
      where: whereCondition,
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
      offset: offset,
      limit: limit,
    });

    const totalCount = await productModel.count();

    if (count === 0) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully.",
      data: products,
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
    const product = await productModel.findOne({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      where: { id: id },
      include: [
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: productImgModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!product) {
      return res
        .status(400)
        .json({ status: false, message: "product not found" });
    }
    return res.status(200).json({ status: false, product });
  } catch (error) {
    return next(error);
  }
};

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
        .json({ status: false, message: "Product id wrong" });
    }
    const findImg = await productImgModel.findAll({
      where: { productId: productId.id },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    // return res.send(findImg);
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
    // delete all product
    const delete_product = await productModel.destroy({ where: { id: id } });

    if (!delete_product) {
      return res
        .status(400)
        .json({ status: false, message: "Product Delete failed" });
    }
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
  const [count, updatedRows] = await productModel.update(
    { ...req.body },
    { where: { id: id }, returning: true }
  );

  if (count === 0) {
    return res.status(400).json({ status: false, message: "Update failed" });
  }
  try {
  } catch (error) {
    return next(error);
  }
};

// Image Section
// as single image delete and multiple image delete

exports.deleteImage = async (req, res, next) => {
  const ids = req.params.ids;
  if (!ids) {
    return res
      .status(400)
      .json({ status: false, message: "image id required" });
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
