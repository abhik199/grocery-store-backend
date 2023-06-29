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
      return res.status(404).json({ message: "not verified" });
    }
    const users = await userModel.findOne({
      where: { email: email },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "roles",
          "verification_token",
          "expiration_time",
          "is_verify",
          "password",
        ],
      },
    });
    // if (req.cookies.access_token) {
    //   return res.json({ msg: "already logging" });
    // }
    // const authHeader = req.headers.authorization;
    // const token = authHeader.split(" ")[1];
    // if (!token) {
    //   return res.send("Where is token");
    // }
    // const token_check = await jwt.verify(token, JWT_SECRET);
    // if (token_check) {
    //   return res.status(401).json({ status: false, message: "" });
    // }

    accessToken = await generateTokens(user);

    return res.status(200).json({
      status: true,
      accessToken,
      message: "Logged in successfully",
      user: users,
    });
  } catch (error) {
    return next(error);
  }
};
