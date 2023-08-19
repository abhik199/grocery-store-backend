const { Op, Sequelize } = require("sequelize");
const joi = require("joi");

const {
  categoryModel,
  productModel,
  productImgModel,
  subcategoryModel,
  reviews_ratingModel,
  productCategoryModels,
} = require("../../models/models");
const { sequelize } = require("../../../config/database");

exports.getCategory = async (req, res, next) => {
  try {
    const { name } = req.query;

    const whereCondition = {};
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }
    const category = await categoryModel.findAll({
      where: whereCondition,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!category || category.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "category not found" });
    }

    const modifiedCategory = category.map((cat) => ({
      id: cat.id,
      name: cat.name,
      category_images: cat.category_images,
      items: cat.items,
    }));

    return res.status(200).json({ status: true, data: modifiedCategory });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAllByCategoryId = async (req, res, next) => {
  const idSchema = joi.object({
    id: joi.number().required(),
  });
  const { error } = idSchema.validate(req.params);
  if (error) {
    return next(error);
  }
  try {
    const categoryId = await categoryModel.findOne({
      where: { id: req.params.id },
    });
    if (!categoryId) {
      return res
        .status(400)
        .json({ status: false, message: "category id wrong" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { name, brand, category, subcategory, minPrice, maxPrice, sort } =
      req.query;
    const whereCondition = {};
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}` };
    }
    if (minPrice) {
      whereCondition.price = {
        [Op.gte]: minPrice,
      };
    }

    if (maxPrice) {
      if (!whereCondition.price) {
        whereCondition.price = {};
      }
      whereCondition.price[Op.lte] = maxPrice;
    }

    const getProduct = await categoryModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: productModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
          where: whereCondition,
          include: [
            {
              model: productImgModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: subcategoryModel,
              attributes: { exclude: ["createdAt", "updatedAt"] },
              as: "subcategories",
            },
          ],
        },
      ],
      offset: offset,
      limit: limit,
    });

    if (!getProduct || Object.keys(getProduct).length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }
    function CallProduct() {
      return (formattedProduct = getProduct.products.map((product) => ({
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
        subcategory: product.subcategories.map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.subcategory,
        })),
        category: getProduct.name,
        product_images: product.product_images.map((image) => image.images),
      })));
    }

    if (category) {
      const CatProduct = await CallProduct();
      if (!CatProduct) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      const filteredProducts = CatProduct.filter(
        (product) =>
          product.category === category &&
          (!brand || product.brand.includes(brand))
      );

      if (filteredProducts.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      const totalCount = filteredProducts.length;
      const totalPages = Math.ceil(totalCount / limit);
      return res.status(200).json({
        status: true,
        products: filteredProducts,
        totalPages,
        totalItems: totalCount,
        currentPage: page,
      });
      return;
    }
    const Product = await CallProduct();
    const products =
      sort === "low_to_high"
        ? Product.slice().sort((a, b) => a.price - b.price)
        : sort === "high_to_low"
        ? Product.slice().sort((a, b) => b.price - a.price)
        : sort === "latest"
        ? Product.slice().sort((a, b) => b.createdAt - a.createdAt)
        : Product;

    const totalCount = products.length;
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
      success: true,
      products: products,
      totalPages,
      totalItems: totalCount,
      currentPage: page,
    });
  } catch (error) {
    return next(error);
  }
};
