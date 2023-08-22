const nodemailer = require("nodemailer");
const config = require("../../config/config");
const ejs = require("ejs");
const path = require("path");
const invoiceService = async (email, userOrders, user) => {
  console.log(email);
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
    const specificDate = new Date();
    const year = specificDate.getFullYear();
    const month = specificDate.getMonth();
    const day = specificDate.getDate();

    const date = `${year}-${month + 1}-${day}`;

    function generateInvoiceNumber(length) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let invoiceNumber = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        invoiceNumber += characters.charAt(randomIndex);
      }

      return invoiceNumber;
    }
    const generatedInvoiceNumber = generateInvoiceNumber(8);

    ejs.renderFile(
      path.join(__dirname, "../../views/invoice.ejs"),
      { userOrders, user, date, generatedInvoiceNumber },
      (err, data) => {
        if (err) {
          console.log(err);
        }

        const message = {
          from: config.email,
          to: email,
          subject: "Text Invoice",
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

module.exports = invoiceService;
