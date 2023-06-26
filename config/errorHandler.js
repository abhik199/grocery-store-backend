const customErrorHandler = require("./customErrorHandler");
require("dotenv").config();

const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let data = {
    message: "Internal server error",
    ...(process.env.DEBUG_MODE === "true" && { originalError: error.message }),
  };
  if (error instanceof customErrorHandler) {
    statusCode = error.status;
    data = {
      message: error.message,
    };
  }

  return res.status(statusCode).json(data);
};

module.exports = errorHandler;
