const { refreshTokenModel } = require("../models/models");

exports.logoutUser = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ status: false, message: "Token is required" });
  }
  try {
    const userToken = await refreshTokenModel.findOne({
      where: { token: refreshToken },
    });
    if (!userToken) {
      return res
        .status(200)
        .json({ status: true, message: "Logged out successfully" });
    }
    await refreshTokenModel.destroy({ where: { token: refreshToken } });
    res.status(200).json({ status: true, message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
};
