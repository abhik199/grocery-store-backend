// Auth Models
exports.userModel = require("./auth/register");
exports.addressesModel = require("./auth/addresses");
exports.refreshTokenModel = require("./auth/refreshToken");
exports.forgotPasswordModel = require("./auth/forgotPassword");

// Product Models
exports.cardModel = require("./card");
exports.categoryModel = require("./category");
exports.productModel = require("./product");
exports.productImgModel = require("./productImage");
exports.orderModel = require("./order");
// exports.productCategory = require("./users/product_category");
exports.reviews_ratingModel = require("./reviews_and_rating");
exports.subcategoryModel = require("./subcategory");

exports.productCategoryModels = require("./product_category");
exports.productSubCategoryModels = require("./product_subcategory");
exports.categorySUbCategoryModels = require("./category_subcategory");
exports.transactionsModels = require("./transactions");
