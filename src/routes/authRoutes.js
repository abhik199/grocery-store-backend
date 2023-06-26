const routes = require("express").Router();
const {
  SignupCtr,
  LoginCtr,
  ChangePasswordCtr,
  ForgotPasswordCtr,
} = require("../auth/auth");
const { imageUpload } = require("./multer");
const auth = require("../../config/middleware");

// POST
routes.post(
  "/signup",
  imageUpload.single("profile"),
  SignupCtr.userRegistration
); // user register with profile
routes.post("/login", LoginCtr.userLogin); // login with email password
routes.post("/change-password", ChangePasswordCtr.changePassword); // password change
routes.post(
  "/request-forgot-password",
  ForgotPasswordCtr.requestForgotPassword
); // user request forgot password using email

// GET
routes.get("/verify_email", SignupCtr.verifyEmail); // User Click This Routes send email
routes.get("/forgot_password", ForgotPasswordCtr.renderPage); // Hit this url Fronted Page Open
// PATCH
// DELETE

routes.patch("/update");
routes.delete("/delete");

module.exports = routes;
