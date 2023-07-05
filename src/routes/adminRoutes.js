const routes = require("express").Router();
const { adminCategory, adminProduct } = require("../controllers/controller");
const { auth, admin } = require("../../config/middleware");
const { upload } = require("./multer");
// category
routes.post(
  "/category",
  [auth, admin],
  upload.single("category_image"),
  adminCategory.createCategory
);
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
routes.get("/product", [auth, admin], adminProduct.fetchAllProducts);
routes.get("/product/:id", [auth, admin], adminProduct.fetchProductById);
routes.patch("/product/:id", [auth, admin], adminProduct.updateProduct);
routes.delete("/product/:id", [auth, admin], adminProduct.deleteProduct);

// product image
routes.delete("/product_image/:ids", [auth, admin], adminProduct.deleteImage);
routes.patch(
  "/product_image/:id",
  [auth, admin],
  upload.single("product_images"),
  adminProduct.updateImage
);

// user order
routes.get("/order", [auth, admin]);
routes.get("/order/:id", [auth, admin]);
routes.patch("/order/:id", [auth, admin]);

module.exports = routes;
