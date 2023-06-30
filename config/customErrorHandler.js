class customErrorHandler extends Error {
  constructor(status, msg) {
    super();
    this.status = status;
    this.message = msg;
  }

  static alreadyExist(message = "Email is already token") {
    return new customErrorHandler(409, message);
  }
  static requiredField(message = "Missing required field") {
    return new customErrorHandler(400, message);
  }

  static wrongCredentials(message = "Incorrect  email and password") {
    return new customErrorHandler(401, message);
  }
  static notFound(message = "not found") {
    return new customErrorHandler(404, message);
  }
  // static  Database error
  static databaseError(message = "Database error") {
    return new customErrorHandler(message);
  }
  static deleteSuccess(message = "Delete successfully") {
    return new customErrorHandler(200, message);
  }
  static deleteFailed(message = "Failed Delete") {
    return new customErrorHandler(400, message);
  }
}

module.exports = customErrorHandler;
