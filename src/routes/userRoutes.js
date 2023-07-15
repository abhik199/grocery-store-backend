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

// user sub_category

routes.get("/subcategory/:id", userSubCategory.fetchProductBySubCategoryId);

// user product
routes.get("/product", userProduct.getProduct);
routes.get("/product/:id", userProduct.getSingleProduct);

// card
routes.post("/card", auth, userCard.addToCart);
routes.patch("/card/:id", auth, userCard.updateCart);
routes.delete("/card/:id", auth, userCard.deleteFromCart);
routes.get("/card", auth, userCard.fetchCartByUser);

// reviews and rating
routes.post("/reviews", auth, userReviewsOnProduct.createProductReviews);

// user order

routes.post("/order", auth, userOrder.createOrder);
routes.get("/pproducts", userProduct.fetchAllPopularProduct);

module.exports = routes;
