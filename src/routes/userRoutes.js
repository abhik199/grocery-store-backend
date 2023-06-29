const routes = require("express").Router();

const { auth } = require("../../config/middleware");
const { CategoryCtr, ProductCtr } = require("../controllers/controller");

// user  category
routes.get("/category", auth, CategoryCtr.getCategory);
routes.get("/product_search", auth, CategoryCtr.productSearchByCategory);

// user product
routes.get("/product", auth, ProductCtr.getProduct);

module.exports = routes;
