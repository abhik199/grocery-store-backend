require("dotenv").config();
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userModel, refreshTokenModel } = require("../models/models");
const customErrorHandler = require("../../config/customErrorHandler");
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
      return next(customErrorHandler.notFound());
    }
    console.log(user.password, password);

    const match = await bcrypt.compare(password, user.password);
    console.log(match);
    if (!match) {
      return next(customErrorHandler.wrongCredentials());
    }
    if (user.isVerify !== true) {
      return res.status(404).json({ message: "User is not verified" });
    }

    if (req.cookies.access_token) {
      return res.json({ msg: "user already logging" });
    }

    const access_token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Refresh Token
    const refresh_token = await jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      REFRESH_SECRET,
      { expiresIn: "1y" }
    );
    const createToken = await refreshTokenModel.create({
      refreshToken: refresh_token,
    });
    if (!createToken) {
      return res.status(500).json({ error: "Failed to create refresh token" });
    }

    return res
      .cookie("access_token", access_token, {
        httpOnly: true,
      })
      .json({
        success: true,
        access_token: access_token,
        refresh_token: refresh_token,
      });
  } catch (error) {
    return next(error);
  }
};
