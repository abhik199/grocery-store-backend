require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateTokens = async (user) => {
  try {
    const payload = { id: user.id, email: user.email, roles: user.roles };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "20d",
    });

    return Promise.resolve(accessToken);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

module.exports = generateTokens;
