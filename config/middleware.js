const jwt = require("jsonwebtoken");
const { userModel } = require("../src/models/models");
const env = require("./env/development");

const auth = async (req, res, next) => {
  try {
    // get token in authHeader
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "unauthorized" });
    }
    const token = authHeader.split(" ")[1];

    try {
      const { id, email, roles } = await jwt.verify(token, env.JWT_SECRET);

      const user = {
        id,
        email,
        roles,
      };
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "unauthorized" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const admin = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ where: { email: req.user.email } });
    if (!user) {
      return res.status(400).json({ message: "User not valid" });
    }
    if (user.roles === "admin") {
      next();
    } else {
      return res.status(401).json({
        status: false,
        message: "You are not authorized to access this resource.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { auth, admin };
