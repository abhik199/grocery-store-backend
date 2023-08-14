const { refreshTokenModel } = require("../models/models");
const { sign } = require("../services/jwtService");
const verifyRefreshToken = require("../utils/verifyRefreshToken");

exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ status: false, message: "Token is required" });
  }

  verifyRefreshToken(refreshToken)
    .then(({ tokenDetails }) => {
      if (!tokenDetails) {
        return res.status(400).json({
          status: false,
          message: "Invalid refresh token",
        });
      }

      const payload = {
        id: tokenDetails.id,
        email: tokenDetails.email,
        roles: tokenDetails.roles,
      };
      const accessToken = sign(payload, "15d");
      if (!accessToken) {
        return res
          .status(400)
          .json({ status: false, message: "Access token creation failed" });
      }

      return res.status(200).json({
        status: true,
        accessToken,
        message: "Access token created successfully",
      });
    })
    .catch((error) => {
      return next(error);
    });
};
