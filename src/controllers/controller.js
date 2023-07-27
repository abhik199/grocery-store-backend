// admin Routes
exports.adminCategory = require("./admin/category");
exports.adminProduct = require("./admin/products");
exports.adminOrder = require("./admin/order");
exports.adminSubCategory = require("./admin/sub_category");
exports.adminDashboard = require("./admin/dashboard");
exports.adminTransactions = require("./admin/transactions");

// user routes
exports.userProduct = require("./users/product");
exports.userOrder = require("./users/order");
exports.userCard = require("./users/card");
exports.userCategory = require("./users/category");
exports.userSubCategory = require("./users/sub_category");
exports.userReviewsOnProduct = require("./users/reviews_rating");
