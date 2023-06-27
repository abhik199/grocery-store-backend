require("dotenv").config();
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userModel, refreshTokenModel } = require("../models/models");
const customErrorHandler = require("../../config/customErrorHandler");
const generateTokens = require("../utils/generateTokens");
const { JWT_SECRET, REFRESH_SECRET } = process.env;

exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(customErrorHandler.requiredField());
  }

  try {
    const user = await userModel.findOne({
      where: { email: email },
    });
    if (!user) {
      return next(customErrorHandler.wrongCredentials());
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return next(customErrorHandler.wrongCredentials());
    }
    if (user.is_verify !== true) {
      return res.status(404).json({ message: "User is not verified" });
    }

    if (req.cookies.access_token) {
      return res.json({ msg: "user already logging" });
    }
    const { accessToken, refreshToken } = await generateTokens(user);

    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
      })
      .status(200)
      .json({
        status: true,
        accessToken,
        refreshToken,
        message: "Logged in successfully",
      });
  } catch (error) {
    return next(error);
  }
};
