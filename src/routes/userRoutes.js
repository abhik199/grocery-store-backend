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
const { verifyTransaction } = require("../controllers/users/payment");

// user  category
routes.get("/category", userCategory.getCategory);
routes.get("/category/:id", userCategory.fetchAllByCategoryId);

// user subcategory
routes.get("/subcategory/:id", userSubCategory.fetchProductBySubCategoryId);
routes.get("/subcategory", userSubCategory.fetchAllSubCategories);

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
routes.patch("/order/:id/cancel", auth, userOrder.requestCancelOrder);
routes.get("/order/:id", auth, userOrder.fetchOrderById);

// testing routes
routes.get("/test/:id", userCategory.fetchAllProductByCategoryId);

// verify transactions
routes.post("/verify", auth, verifyTransaction);

// product listing
routes.get("/popular_product", userProduct.fetchAllPopularProduct);
routes.get("/daily_sells", userProduct.fetchDailyBestSellsProduct);
routes.get("/deals_of_day");
// routes.get("/top_selling");    TODO  at this time i am not working
// routes.get("recently_added");  TODO

module.exports = routes;
