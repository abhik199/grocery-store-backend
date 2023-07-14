const jwt = require("jsonwebtoken");

const env = require("../../config/env/development");

class JwtService {
  static sign(payload, expiry = "1y", secret = env.JWT_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }

  static verify(token, secret = env.JWT_SECRET) {
    return jwt.verify(token, secret);
  }
}

module.exports = JwtService;
