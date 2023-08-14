const { refreshTokenModel } = require("../models/models");
const { REFRESH_SECRET } = require("../../config/config");
const jwt = require("jsonwebtoken");
const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    refreshTokenModel.findOne({ token: refreshToken }, (err, doc) => {
      if (!doc) {
        return reject({ status: false, message: "Invalid refresh token" });
      }
      jwt.verify(refreshToken, REFRESH_SECRET, (err, tokenDetails) => {
        if (err) {
          return reject({ status: false, message: "Invalid refresh token" });
        }
        resolve({
          tokenDetails,
          status: true,
          message: "Valid refresh token",
        });
      });
    });
  });
};

module.exports = verifyRefreshToken;
