const { addressesModel, userModel } = require("../models/models");
const joi = require("joi");
// good 

exports.createAddress = async (req, res, next) => {
  const { id } = req.user;
  const addressSchema = joi.object({
    full_name: joi.string().max(15).min(5).required(),
    contact: joi.number().required(),
    country: joi.string().required(),
    state: joi.string().required(),
    city: joi.string().required(),
    post_code: joi.number(),
    address: joi.string().required(),
   
  });
  const { error } = addressSchema.validate(req.body);
  if (error) {
    return next(error);
  }

  try {
    const user = await userModel.findOne({ where: { id: id } });
    if (!user) {
      return res.status(400).json({ message: "id not valid" });
    }

    const create_address = await addressesModel.create({
      ...req.body,
      userId: id,
    });
    if (!create_address) {
      return res
        .status(400)
        .json({ status: false, message: "Address failed to save" });
    }

    return res.status(201).json({
      status: true,
      message: "Address successfully saved",
      address: create_address,
    });
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
        .json({ status: false, message: "Address update failed" });
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
      .json({ status: false, message: "Address ID required" });
  }
  try {
    const user = await addressesModel.findOne({ where: { id: id } });
    if (!user) {
      return res.status(400).json({ status: false, message: "Invalid ID" });
    }
    const address = await addressesModel.destroy({ where: { id: id } });
    if (!address) {
      return res.status(400).json({ status: false, message: "Delete failed" });
    }
    return res.status(200).json({ status: true, message: "Address deleted" });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAddressByUser = async (req, res, next) => {
  const { id } = req.user;
  try {
    const address = await addressesModel.findAll({
      where: { userId: id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: "address not found" });
    }
    return res.status(200).json({ status: true, address });
  } catch (error) {
    return next(error);
  }
};

exports.fetchAddressByID = async (req, res, next) => {
  const { id: userId } = req.user;
  const { id } = req.params;
  try {
    const address = await addressesModel.findOne({ where: { id: id } });
    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: "address not found" });
    }
    return res.status(200).json({ status: true, address });
  } catch (error) {
    return next(error);
  }
};
