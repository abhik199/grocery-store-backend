const { addressesModel, userModel } = require("../models/models");

exports.createAddress = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ where: { id: req.body.userId } });
    if (!user) {
      return res.status(400).json({ message: "User id not valid" });
    }
    // const { first_name, last_name } = user;
    // fullName = `${first_name} ${last_name}`;

    const create_address = await addressesModel.create(req.body);
    if (!create_address) {
      return res
        .status(400)
        .json({ status: false, message: "address creating Failed" });
    }
    return res.status(201).json({ status: true, message: "created" });
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
    const address = await addressesModel.update(req.body, {
      where: { id: id },
    });
    if (!address) {
      return res
        .status(400)
        .json({ status: false, message: "address update Failed" });
    }
    return res.status(201).json({ status: true, message: "Updated" });
  } catch (error) {
    return next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ status: false, message: "address id required" });
  }
  try {
    const user = await addressesModel.findOne({ where: { id: id } });
    if (!user) {
      return res.status(400).json({ status: false, message: "Id not valid" });
    }
    const address = await addressesModel.destroy({ where: { id: id } });
    if (!address) {
      return res.status(400).json({ status: false, message: "delete failed" });
    }
    return res.status(200).json({ status: true, message: "address created" });
  } catch (error) {
    return next(error);
  }
};
