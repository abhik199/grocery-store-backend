require("dotenv").config();
const { refreshTokenModel } = require("../models/models");
const jwt = require("jsonwebtoken");

const verifyRefreshToken = (refreshToken) => {
  return async (req, res) => {
    try {
      const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;

      const doc = await refreshTokenModel.findOne({
        where: { token: refreshToken },
      });
      if (!doc) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid refresh token" });
      }

      const tokenDetails = await jwt.verify(refreshToken, privateKey);
      return res.status(200).json({
        tokenDetails,
        error: false,
        message: "Valid refresh token",
      });
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: error.message || "Error retrieving refresh token",
      });
    }
  };
};

module.exports = verifyRefreshToken;
