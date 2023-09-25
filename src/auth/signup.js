const { DataTypes } = require("sequelize");

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const fs = require("fs");
const path = require("path");

const { userModel, addressesModel } = require("../models/models");
const customErrorHandler = require("../../config/customErrorHandler");
const emailService = require("../services/emailServices");

// Generate a verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

exports.userRegistration = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res
      .status(400)
      .json({ status: false, message: "Missing required field" });
  }

  try {
    const users = await userModel.findOne({ where: { email: email } });

    if (users) {
      if (req.file !== undefined) {
        const folderPath = path.join(__dirname, "public/profile");
        const filePath = path.join(folderPath, req.file.filename);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });
      }
     return res.status(400).json({
  status: false,
  statusCode: 400,
  message: 'Email is already taken',
});
    }
    const user = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 30); // 30 minute
    user.password = hashPassword;
    user.verification_token = verificationToken;
    user.expiration_time = expirationTime;
   
    const createUser = await userModel.create(user);
    if (!createUser || !createUser.length === 0) {
      res.status(400).json({
        status: false,
        message: "Registration Failed",
      });
      return;
    }
    res.status(201).json({
      status: true,
      message: "Registration Successfully",
    });

    // signup(user.name, user.email, user.verification_token);    // use only production time
    emailService(user.name, user.email, user.verification_token);

    if (req.file !== undefined && !req.file.length > 0) {
      const imageUrl = req.file.filename;

      try {
        await userModel.update(
          {
            profile: imageUrl,
          },
          { where: { id: createUser.id }, returning: true }
        );
      } catch (error) {
        const folderPath = path.join(__dirname, "public/profile");

        const filePath = path.join(folderPath, imageUrl);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};
// Nodemailer Email Send

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, verificationToken } = req.query;

    const findToken = await userModel.findOne({
      where: { verification_token: verificationToken },
    });

    if (!findToken || findToken.expiration_time < new Date()) {
      res.status(400).send("Wrong & Expired Token");
    }

    const updateUser = await userModel.update(
      {
        is_verify: true,
        verification_token: null,
      },
      { where: { verification_token: verificationToken } }
    );

    if (!updateUser) {
      return res.status(409).send("Email Verification failed");
    }
    return res.status(200).send("email verification successfully");
  } catch (error) {
    return next(error);
  }
}

