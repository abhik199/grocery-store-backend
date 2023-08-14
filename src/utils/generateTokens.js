const { REFRESH_SECRET } = require("../../config/config");
const { sign } = require("../services/jwtService");
const { refreshTokenModel } = require("../models/models");

const generateTokens = async (user) => {
  try {
    const payload = { id: user.id, email: user.email, roles: user.roles };
    const accessToken = sign(payload, "15d");
    const refreshToken = sign({ payload }, "180d", REFRESH_SECRET);

    // create and remove old refresh token in data base
    const userToken = await refreshTokenModel.findOne({
      where: { userId: user.id },
    });
    if (userToken) {
      await refreshTokenModel.destroy({ where: { userId: user.id } });
    }
    await refreshTokenModel.create({ token: refreshToken, userId: user.id });

    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

module.exports = generateTokens;
