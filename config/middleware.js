const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    // get token in authHeader
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "unauthorized user1" });
    }
    const token = authHeader.split(" ")[1];

    try {
      const { id, email, role } = await jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = {
        id,
        email,
        role,
      };
      req.user = user;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "unauthorized user" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = auth;
