const routes = require("express").Router();

const { auth } = require("../../config/middleware");
const {
  userOrder,
  userCategory,
  userProduct,
  userCard,
} = require("../controllers/controller");

// user  category
routes.get("/category", userCategory.getCategory);
routes.get("/category/:id", userCategory.getProductByCategory);

// user product
routes.get("/product", userProduct.getProduct);
routes.get("/product/:id", userProduct.getSingleProduct);

// card
routes.post("/card", auth, userCard.addToCart);
routes.patch("/card/:id", auth, userCard.updateCart);
routes.delete("/card/:id", auth, userCard.deleteFromCart);
routes.get("/card", auth, userCard.fetchCartByUser);

module.exports = routes;
