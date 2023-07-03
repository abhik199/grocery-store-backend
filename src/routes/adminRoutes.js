const routes = require("express").Router();
const { adminCategory, adminProduct } = require("../controllers/controller");
const { auth, admin } = require("../../config/middleware");
const { upload } = require("./multer");
// category
routes.post("/category", [auth, admin], adminCategory.createCategory);
routes.patch("/category/:id", [auth, admin], adminCategory.updateCategory);
routes.delete("/category/:id", [auth, admin], adminCategory.deleteCategory);
routes.get("/category", [auth, admin], adminCategory.getCategory);
routes.get("/category/:id", [auth, admin], adminCategory.getSingleCategory);

// product
routes.post(
  "/product",
  upload.array("product_images", 5),
  adminProduct.createProducts
);

routes.delete("/product/:id", [auth, admin], adminProduct.deleteProduct);

module.exports = routes;
