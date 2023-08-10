const nodemailer = require("nodemailer");
const config = require("../../config/config");
const ejs = require("ejs");
const path = require("path");
const emailService = async (name, email, verification_token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.email,
        pass: config.password,
      },
    });
    const email_url = `${config.url}/auth/verify_email?verificationToken=${verification_token}&email=${email}`;
    ejs.renderFile(
      path.join(__dirname, "../../views/email.ejs"),
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

module.exports = emailService;
