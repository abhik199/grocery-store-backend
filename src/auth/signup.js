require("dotenv").config();
const { DataTypes } = require("sequelize");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Url = process.env.url;

const { userModel, addressesModel } = require("../models/models");
const customErrorHandler = require("../../config/customErrorHandler");

// Generate a verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

const signup = async (name, email, verification_token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    const email_url = `${Url}/auth/verify_email?verificationToken=${verification_token}&email=${email}`;
    ejs.renderFile(
      path.join(process.cwd(), "views/email.ejs"),
      { email_url, name },
      (err, data) => {
        if (err) {
          console.log(err);
        }

        const message = {
          from: "grocery store",
          to: email,
          subject: "Verification Mail",
          html: data,
        };
        transporter.sendMail(message, (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
      }
    );
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

exports.userRegistration = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return next(customErrorHandler.requiredField());
  }
  try {
    const users = await userModel.findOne({ where: { email: email } });

    if (users) {
      if (req.file.filename) {
        const folderPath = path.join(process.cwd(), "public/profile");
        const filePath = path.join(folderPath, req.file.filename);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.log(`Failed to delete: ${error.message}`);
          }
        });
      }
      return next(customErrorHandler.alreadyExist());
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
        message: "Failed to create user",
      });
      return;
    }
    res.status(201).json({
      status: true,
      message: "User created successfully",
    });

    signup(user.name, user.email, user.verification_token);

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
        const folderPath = path.join(process.cwd(), "public/profile");
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
        verification_token: "null",
        expiration_time: "null",
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
};
