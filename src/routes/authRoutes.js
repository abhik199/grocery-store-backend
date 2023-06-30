const routes = require("express").Router();
const {SignupCtr,LoginCtr,ChangePasswordCtr,ForgotPasswordCtr,LogoutCtr,UpdateCtr,RefreshTokenCtr,AddressCtr,ProfileCtr} = require("../auth/auth");
const { upload } = require("./multer");
const {auth} = require("../../config/middleware");

// POST
routes.post("/signup",upload.single("profile"),SignupCtr.userRegistration); // user register with profile
routes.post("/login", LoginCtr.userLogin); // login with email password
routes.post("/change-password",auth, ChangePasswordCtr.changePassword); // password change
routes.post("/request-forgot-pass", auth, ForgotPasswordCtr.requestForgotPassword); // user request forgot password using email

routes.post('/refresh-token',RefreshTokenCtr.refreshToken)

// GET
routes.get("/verify_email", SignupCtr.verifyEmail); // User Click This Routes send email
routes.get("/forgot_password", ForgotPasswordCtr.renderPage); // Hit this url Fronted Page Open
routes.get('/logout',auth,LogoutCtr.logoutUser)
routes.patch("/update/:id", auth, upload.single('profile'), UpdateCtr.userUpdate);

// address 
routes.get("/address", auth, AddressCtr.fetchAddressByUser);
routes.post('/address', auth, AddressCtr.createAddress);
routes.patch('/address/:id', auth, AddressCtr.updateAddress);
routes.delete('/address/:id', auth, AddressCtr.deleteAddress);

// profile 
routes.get('/profile',auth,ProfileCtr.getProfile)


module.exports = routes;
