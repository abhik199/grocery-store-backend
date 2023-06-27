const { addressesModel, userModel } = require("../models/models");

exports.createAddress = async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User id required" });
  }

  try {
    const user = await userModel.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ message: "User id not valid" });
    }

    const create_address = await addressesModel.create(req.bo);
  } catch (error) {
    return next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ status: false, message: "userId required" });
  }

  try {
    const user = await addressesModel.findOne({ where: { id: id } });
    if (!user) {
      return res.status(400).json({ status: false, message: "Id not valid" });
    }
  } catch (error) {
    return next(error);
  }
};
