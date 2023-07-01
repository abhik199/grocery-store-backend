const customErrorHandler = require("../../config/customErrorHandler");
const { userModel } = require("../models/models");
const path = require("path");
const fs = require("fs");

exports.userUpdate = async (req, res, next) => {
  const { id } = req.user;
  if (!id) {
    return res.status(400).json({ message: "ID is required." });
  }

  const { first_name, last_name } = req.body;
  const updateFields = {};

  if (first_name) {
    updateFields.first_name = first_name;
  }

  if (last_name) {
    updateFields.last_name = last_name;
  }

  try {
    const userId = await userModel.findOne({ where: { id: id } });
    if (!userId) {
      return res.status(400).json({ message: "Id not valid" });
    }

    if (req.file !== undefined) {
      try {
        // delete old image
        const { profile } = await userModel.findOne({
          where: { id: userId.id },
        });
        const folderPath = path.join(process.cwd(), "public/profile");
        const filePath = path.join(folderPath, profile);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });

        updateFields.profile = req.file.filename;
      } catch (error) {
        // remove image error accrued code
        const folderPath = path.join(process.cwd(), "public/profile");
        const filePath = path.join(folderPath, req.file.filename);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });
      }
    }

    const [affectedRows, updatedRows] = await userModel.update(updateFields, {
      where: { id: userId.id },
      returning: true,
    });
    if (!updatedRows) {
      res.status(400).json({ message: "Update failed" });
    }
    res.status(200).json({ message: "update successful" });
  } catch (error) {
    return next(error);
  }
};
