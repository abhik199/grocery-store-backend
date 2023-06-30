const {
  productModel,
  productImgModel,
  categoryModel,
} = require("../../models/models");
const customErrorHandler = require("../../../config/customErrorHandler");
const { Op } = require("sequelize");

exports.createProducts = async (req, res, next) => {
  const {
    name,
    price,
    brand,
    discount_price,
    categoryId,
    tag,
    stock,
    thumbnail,
  } = req.body;
  if (!name || !price || !discount_price || !brand || !stock || !categoryId) {
    return next(customErrorHandler.requiredField());
  }
  if (!req.file.filename) {
    return res
      .status(400)
      .json({ status: false, message: "thumbnail image required" });
  }
  console.log(req.file.filename);
  try {
    const selling_price = price;
    const discounted_price = discount_price;
    const discounted_percentage =
      ((selling_price - discounted_price) / selling_price) * 100;
    const Product = await productModel.create({
      ...req.body,
      discount_percentage: discounted_percentage,
    });
    if (!Product || !Product.length === 0) {
      res.status(400).json({
        status: false,
        message: "product create Failed",
      });
      return;
    }
    res.status(201).json({
      status: true,
      message: "product created successfully",
    });

    if (req.files !== undefined && req.files.length > 0) {
      const imageFiles = req.files;

      try {
        const productImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const imagePath = `${imageFiles[i].filename}`;
          await productImgModel.create({
            productId: Product.id,
            images: imagePath,
          });
          productImages.push(imagePath);
        }
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
  } catch (error) {
    return next(error);
  }
};
exports.getProduct = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name } = req.query;

    const whereCondition = {};

    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    //
    const { count, rows: products } = await productModel.findAndCountAll({
      where: whereCondition,
      attributes: {
        exclude: ["createdAt", "updatedAt", "categoryId", "thumbnail"],
      },
      include: [
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: productImgModel,
          attributes: { exclude: ["createdAt", "updatedAt", "productId"] },
        },
      ],
      offset: offset,
      limit: limit,
    });
    const counts = await productModel.count();

    if (count === 0) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: true,
      message: "Product retrieved successfully.",
      data: products,
      totalPages,
      totalItems: counts,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSingleProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "product id required" });
  }

  try {
    const product = await productModel.findOne({
      attributes: {
        exclude: ["createdAt", "updatedAt", "categoryId", "thumbnail"],
      },
      where: { id: id },
      include: [
        {
          model: categoryModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: productImgModel,
          attributes: { exclude: ["createdAt", "updatedAt", "productId"] },
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
