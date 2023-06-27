require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const path = require("path");
const ejs = require("ejs");
const Url = process.env.url;

const { userModel, forgotPasswordModel } = require("../models/models");
const customErrorHandler = require("../../config/customErrorHandler");

// Generate a verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

// -------------------------Email Logic ------------------------------------

const Forgot = async (name, email, key) => {
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
    const resetPasswordLink = `${Url}/auth/forgot_password?key=${key}&email=${email}`;

    ejs.renderFile(
      path.join(process.cwd(), "views/forgot.ejs"),
      { resetPasswordLink, name },
      (err, data) => {
        if (err) {
          console.log(err);
        }
        const message = {
          from: "Forgot Password Mail",
          to: email,
          subject: "Forgot Password Mail",
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

exports.requestForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(customErrorHandler.requiredField());
  }
  try {
    // Check email id
    const user = await userModel.findOne({ where: { email: email } });
    if (!user) {
      return next(customErrorHandler.notFound("username not found"));
    }
    const resetPasswordToken = generateVerificationToken();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 60); // Set

    const storeToken = await forgotPasswordModel.create({
      key: resetPasswordToken,
      expiration_time: expirationTime,
    });
    if (!storeToken) {
      return res.status(400).json({
        success: false,
        message: "Something Went Wrong",
      });
    }
    // Email send Verified Email id
    Forgot(user.name, user.email, storeToken.key);
    return res.status(200).json({
      success: true,
      message:
        "The password reset process has now been started. Please check your email for instructions on what to do next",
    });
  } catch (error) {
    return next(error);
  }
};

// ---------------------- New Password ------------------------
exports.renderPage = async (req, res, next) => {
  const { key, email } = req.query;
  if (!key || !email) {
    return next(customErrorHandler.requiredField());
  }
  try {
    const keyRecord = await forgotPasswordModel.findOne({
      where: { key: key },
    });

    if (!keyRecord || keyRecord.expirationTime < new Date()) {
      // OTP not found or expired
      res.status(400).send("Wrong & Expired Token ");
      return false;
    }

    if (req.query.new_password) {
      const { new_password } = req.query;
      try {
        const hashPassword = await bcrypt.hash(new_password, 10);
        const updatePassword = await userModel.update(
          {
            password: hashPassword,
          },
          {
            where: {
              email: email,
            },
          }
        );
        if (!updatePassword) {
          return res.send("Update failed");
        }
        return res.send("Update done");
      } catch (error) {
        res.send("Something went wrong");
      }
    }
    await forgotPasswordModel.destroy({ where: { key: key } });
    return;
  } catch (error) {
    return next(error);
  }
};
