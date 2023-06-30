const { userModel, addressesModel } = require("../models/models");

exports.getProfile = async (req, res, next) => {
  const { id } = req.user;
  try {
    const profile = await userModel.findOne({
      where: { id: id },
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "password",
          "is_verify",
          "expiration_time",
          "verification_token",
          "roles",
        ],
      },
      include: [
        {
          model: addressesModel,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
      ],
    });
    if (!profile) {
      return res
        .status(400)
        .json({ status: false, message: "profile not found" });
    }
    return res.status(200).json({ status: true, profile });
  } catch (error) {
    return next(error);
  }
};
