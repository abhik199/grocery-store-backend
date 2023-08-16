const { refreshTokenModel } = require("../models/models");
const { REFRESH_SECRET } = require("../../config/config");
const jwt = require("jsonwebtoken");

const verifyRefreshToken = async (refreshToken) => {
  try {
    const doc = await refreshTokenModel.findOne({
      where: {
        token: refreshToken,
      },
    });

    if (!doc) {
      return { status: false, message: "Invalid refresh token" };
    }

    const tokenDetails = jwt.verify(refreshToken, REFRESH_SECRET);
    return {
      tokenDetails,
      status: true,
      message: "Valid refresh token",
    };
  } catch (err) {
    return { status: false, message: "Invalid refresh token" };
  }
};

module.exports = verifyRefreshToken;
