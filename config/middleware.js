const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");

const auth = async (req, res, next) => {
  try {
    // get token in authHeader
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).send("UnAuthorization user");
    }
    const token = authHeader.split(" ")[1];
    try {
      const { id, email } = await jwt.verify(token, JWT_SECRET);
      console.log(id, email);
      const user = {
        id,
        email,
        role,
      };
      req.user = user;
      next();
    } catch (error) {
      res.status(401).send("UnAuthorization user");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = { auth };
