const { REFRESH_SECRET } = require("../../config/config");
const { sign } = require("../services/jwtService");

const generateTokens = async (user) => {
  try {
    const payload = { id: user.id, email: user.email, roles: user.roles };
    const accessToken = sign(payload, "15d");
    const refreshToken = sign({ payload }, "1y", REFRESH_SECRET);

    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

module.exports = generateTokens;
