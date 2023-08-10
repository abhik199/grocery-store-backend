const bcrypt = require("bcrypt");

const { userModel } = require("../models/models");
const customErrorHandler = require("../../config/customErrorHandler");
const generateTokens = require("../utils/generateTokens");

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
      return res
        .status(400)
        .json({ status: false, message: "Email does not exist" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(400)
        .json({ status: false, message: "Incorrect password" });
    }

    if (user.is_verify !== true) {
      return res.status(404).json({ message: "not verified" });
    }
    console.log(user.email);
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

    const { accessToken, refreshToken } = await generateTokens(user);

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
