const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../../config/config");

function sign(payload, expiry = "60s", secret = JWT_SECRET) {
  return jwt.sign(payload, secret, { expiresIn: expiry });
}

function verify(token, secret = JWT_SECRET) {
  return jwt.verify(token, secret);
}

module.exports = {
  sign,
  verify,
};
