const routes = require("express").Router();

const { auth } = require("../../config/middleware");
const {
  userOrder,
  userCategory,
  userProduct,
  userCard,
  userReviewsOnProduct,
  userSubCategory,
} = require("../controllers/controller");

// user  category
routes.get("/category", userCategory.getCategory);
routes.get("/category/:id", userCategory.fetchAllByCategoryId);

// user subcategory
routes.get("/subcategory/:id", userSubCategory.fetchProductBySubCategoryId);

// user product

routes.get("/product", userProduct.fetchAllPopularProduct); // i am using for testing
routes.get("/product/:id", userProduct.getSingleProduct);
routes.get("/popular_product", userProduct.fetchAllPopularProduct);

// card
routes.post("/card", auth, userCard.addToCart);
routes.patch("/card/:id", auth, userCard.updateCart);
routes.delete("/card/:id", auth, userCard.deleteFromCart);
routes.get("/card", auth, userCard.fetchCartByUser);

// reviews and rating
routes.post("/reviews", auth, userReviewsOnProduct.createProductReviews);

// user order

routes.post("/order", auth, userOrder.createOrder);
routes.get("/order", auth, userOrder.fetchAllOrderByUse);

// testing routes
routes.get("/test/:id", userCategory.fetchAllProductByCategoryId);

module.exports = routes;
