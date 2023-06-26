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

    const create_address = await addressesModel.create({});
  } catch (error) {
    return next(error);
  }
};
