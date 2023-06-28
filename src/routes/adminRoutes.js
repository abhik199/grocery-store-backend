const routes = require("express").Router();
const { CategoryCtr } = require("../controllers/controller");
const { auth, admin } = require("../../config/middleware");

routes.post("/category", [auth, admin], CategoryCtr.createCategory);
routes.patch("/category/:id", [auth, admin], CategoryCtr.updateCategory);
routes.delete("/category/:id", [auth, admin], CategoryCtr.deleteCategory);

module.exports = routes;
