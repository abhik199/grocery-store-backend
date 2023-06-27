require("dotenv").config();
const jwt = require("jsonwebtoken");
const { refreshTokenModel } = require("../models/models");

const generateTokens = async (user) => {
  try {
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "14m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
    });

    const existingUserToken = await refreshTokenModel.findOne({
      where: { userId: user.id },
    });

    if (existingUserToken) {
      await refreshTokenModel.destroy({ where: { userId: user.id } });
    }

    await refreshTokenModel.create({
      userId: user.id,
      token: refreshToken,
    });
    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

module.exports = generateTokens;
