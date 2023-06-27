const { refreshTokenModel } = require("../models/models");
const customErrorHandler = require("../../config/customErrorHandler");

exports.logoutUser = async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    return next(customErrorHandler.requiredField("token"));
  }

  try {
    const logOut = await refreshTokenModel.destroy({
      where: { refresh_token: token },
    });

    if (!logOut) {
      return res.status(400).json({ msg: "User logout failed" });
    }

    return res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
    return;
  }
};
