const routes = require("express").Router();
const {adminCategory,adminProduct,adminOrder,adminSubCategory,adminDashboard,adminTransactions} = require("../controllers/controller");
const { auth, admin } = require("../../config/middleware");
const { upload } = require("./multer");


// dashboard 
routes.get('/users/:user',adminDashboard.dashboardUsers)
routes.get('/active_order',[auth,admin],adminDashboard.dashboardOrder)


// category
routes.post("/category",[auth, admin],upload.single("category_image"),adminCategory.createCategory);
routes.patch("/category/:id",[auth, admin],upload.single("category_image"),adminCategory.updateCategory);
routes.delete("/category/:id", [auth, admin], adminCategory.deleteCategory);
routes.get("/category", [auth, admin,], adminCategory.fetchAllCategoryByAmin);
routes.get("/category/:id", [auth, admin], adminCategory.fetchCategoryById);

// sub_category 
routes.post('/subcategory', [auth, admin],upload.single('subcategory_image'), adminSubCategory.createSubcategory);
routes.delete('/subcategory/:id', [auth, admin],adminSubCategory.deleteSubCategory);
routes.patch('/subcategory/:id', [auth, admin], upload.single('subcategory_image'), adminSubCategory.updateSubCategory);
// remove remove authentication for testing 
routes.get('/subcategory', [auth, admin], adminSubCategory.fetchSubCategoryByAdmin)
routes.get('/subcategory/:id', [auth, admin], adminSubCategory.fetchSubCategoryById)

// filter subcategory linked category
routes.get('/category/:id/subcategories',[auth,admin],adminSubCategory.fetchSubCategoryByCategoryId)

// product 
routes.post('/product',[auth,admin],upload.array('product_images'),adminProduct.createProducts)
routes.get("/product", [auth, admin], adminProduct.fetchAllProducts);
routes.get("/product/:id", [auth, admin], adminProduct.fetchProductById);
routes.patch("/product/:id", [auth, admin], adminProduct.updateProduct);
routes.delete("/product/:id", [auth, admin], adminProduct.deleteProduct);

// product image
routes.delete("/product_image/:ids", [auth, admin], adminProduct.deleteImage);
routes.patch("/product_image/:id",[auth, admin],upload.single("product_images"),adminProduct.updateImage);

// user order
routes.get("/order", [auth, admin], adminOrder.fetchAllOrderByAdmin);
routes.get("/order/:id", [auth, admin],adminOrder.fetchOrdersById);
routes.patch("/order/:id", [auth, admin], adminOrder.updateOrderStatus);

// transactions
routes.get('/transactions', [auth, admin],adminTransactions.fetchAllTransactionsByAdmin)
routes.get('/transactions/:id', [auth, admin],adminTransactions.fetchTransactionsById)
routes.delete('/transactions/:id',[auth,admin],adminTransactions.deleteTransactions)



module.exports = routes;
