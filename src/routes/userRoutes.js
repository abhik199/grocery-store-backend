const routes = require("express").Router();

const { auth } = require("../../config/middleware");
const { CategoryCtr } = require("../controllers/controller");
routes.get("/category", auth, CategoryCtr.getCategory);

module.exports = routes;
