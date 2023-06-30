const routes = require("express").Router();
const { CategoryCtr, ProductCtr } = require("../controllers/controller");
const { auth, admin } = require("../../config/middleware");
const { upload } = require("./multer");
// category
routes.post("/category", [auth, admin], CategoryCtr.createCategory);
routes.patch("/category/:id", [auth, admin], CategoryCtr.updateCategory);
routes.delete("/category/:id", [auth, admin], CategoryCtr.deleteCategory);

// product
routes.post(
  "/product",
  [auth, admin],
  upload.single("thumbnail"),
  upload.array("product_images", 5),
  ProductCtr.createProducts
);

module.exports = routes;
