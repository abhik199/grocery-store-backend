const customErrorHandler = require("../../config/customErrorHandler");
const { userModel } = require("../models/models");
const path = require("path");
const fs = require("fs");

exports.userUpdate = async (req, res, next) => {
  const { name } = req.body;
  if (!req.params.id) {
    return res.status(400).json({ message: "ID is required." });
  }
  try {
    const userId = await userModel.findOne({ where: { id: req.params.id } });
    if (!userId) {
      return res.status(400).json({ message: "Id not valid" });
    }

    const [affectedRows, updatedRows] = await userModel.update(
      {
        name,
        address,
      },
      { where: { id: userId.id }, returning: true }
    );
    if (!updatedRows) {
      return res.status(400).json({ message: "Update failed" });
    }
    res.status(200).json({ message: "Update successful" });

    if (req.file !== undefined && req.file.length > 0) {
      const imageUrl = req.file.filename;
      const folderPath = path.join(process.cwd(), "public/profile");
      // If not get image without Map()
      const fileNames = imageUrl.map((img) => {
        return img;
      });

      try {
        // delete old image
        const { profile } = await userModel.findOne({
          where: { id: userId.id },
        });
        const fileNames = profile.map((img) => {
          return img;
        });
        fileNames.forEach((fileName) => {
          const filePath = path.join(folderPath, fileName);

          fs.unlink(filePath, (error) => {
            if (error) {
              console.log(`Failed to delete ${error.message}`);
            }
          });
        });

        await userModel.update(
          {
            profile: imageUrl,
          },
          { where: { id: userId.id }, returning: true }
        );
      } catch (error) {
        // remove image error accrued code
        fileNames.forEach((fileName) => {
          const filePath = path.join(folderPath, fileName);

          fs.unlink(filePath, (error) => {
            if (error) {
              console.log(`Failed to delete ${error.message}`);
            }
          });
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};
