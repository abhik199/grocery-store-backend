const verifyRefreshToken = require("../utils/verifyRefreshToken");
const jwt = require("jsonwebtoken");
const { refreshTokenModel } = require("../models/models");
const { JWT_SECRET } = require("../../config/config");

exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ status: false, message: "Token is required" });
  }
  try {
    const tokenDetails = await refreshTokenModel.findOne({
      where: { token: refreshToken },
    });
    if (tokenDetails) {
      const payload = {
        id: tokenDetails.id,
        role: tokenDetails.role,
        email: tokenDetails.email,
      };
      const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "14m",
      });
      res.status(200).json({
        status: true,
        accessToken,
        message: "Access token created successfully",
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Access token created failed",
      });
    }
  } catch (error) {
    return next(error);
  }
};
