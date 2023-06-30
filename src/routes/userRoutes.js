const routes = require("express").Router();

const { auth } = require("../../config/middleware");
const {
  CategoryCtr,
  ProductCtr,
  CardCtr,
} = require("../controllers/controller");

// user  category
routes.get("/category", auth, CategoryCtr.getCategory);
routes.get("/product_search", auth, CategoryCtr.productSearchByCategory);

// user product
routes.get("/product", auth, ProductCtr.getProduct);
routes.get("/product/:id", auth, ProductCtr.getSingleProduct);

// card
routes.post("/card", auth, CardCtr.addToCart);
routes.patch("/card/:id", auth, CardCtr.updateCart);
routes.delete("/card/:id", auth, CardCtr.deleteFromCart);
routes.get("/card", auth, CardCtr.fetchCartByUser);

module.exports = routes;
