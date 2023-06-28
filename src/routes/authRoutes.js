const routes = require("express").Router();
const {SignupCtr,LoginCtr,ChangePasswordCtr,ForgotPasswordCtr,LogoutCtr,UpdateCtr,RefreshTokenCtr,AddressCtr} = require("../auth/auth");
const { imageUpload } = require("./multer");
const {auth} = require("../../config/middleware");

// POST
routes.post("/signup",imageUpload.single("profile"),SignupCtr.userRegistration); // user register with profile
routes.post("/login", LoginCtr.userLogin); // login with email password
routes.post("/change-password",auth, ChangePasswordCtr.changePassword); // password change
routes.post("/request-forgot-pass", auth, ForgotPasswordCtr.requestForgotPassword); // user request forgot password using email

routes.post('/refresh-token',RefreshTokenCtr.refreshToken)

// GET
routes.get("/verify_email", SignupCtr.verifyEmail); // User Click This Routes send email
routes.get("/forgot_password", ForgotPasswordCtr.renderPage); // Hit this url Fronted Page Open
routes.get('/logout',auth,LogoutCtr.logoutUser)
routes.patch("/update/:id", auth, imageUpload.single('profile'), UpdateCtr.userUpdate);

// address 
routes.post('/address', AddressCtr.createAddress)
routes.patch('/address/:id', AddressCtr.updateAddress)
routes.delete('/delete_address',AddressCtr.deleteAddress)

// routes.patch('/address',AddressCtr)


module.exports = routes;
