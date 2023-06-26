const customErrorHandler = require("../../config/customErrorHandler");
const { userModel } = require("../models/models");
const bcrypt = require("bcrypt");

exports.changePassword = async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email && !oldPassword && newPassword) {
    return next(customErrorHandler.requiredField());
  }
  try {
    const user = await userModel.findOne({
      where: { email: email },
    });
    if (!user) {
      return next(customErrorHandler.notFound());
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return next(customErrorHandler.wrongCredentials());
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateResult = await userModel.update(
      { password: hashedPassword },
      { where: { email: email } }
    );

    if (updateResult[0] === 0) {
      return res.status(500).json({ msg: "Failed to update password" });
    }

    return res.json({ msg: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
};
