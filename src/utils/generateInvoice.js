const fs = require("fs");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const path = require("path");
function makeid(length) {
  var result = "";
  var characters = "0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const generateInvoice = async (email, userOrders, user) => {
  function generateInvoiceNumber(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let invoiceNumber = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      invoiceNumber += characters.charAt(randomIndex);
    }

    return invoiceNumber;
  }

  async function generatePDFFromHTML(htmlContent, outputPath, pdfName) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
      await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

      await page.waitForSelector("body", { waitUntil: "networkidle2" });
      await page.addStyleTag({
        path: path.join(__dirname, "../../public/style/style.css"),
      });
      //     "../../public/style/style.css"

      await page.pdf({ path: outputPath, format: "A4" });

      console.log("PDF generated successfully.");
    } catch (error) {
      console.error("Error generating PDF: ", error);
    } finally {
      await browser.close();
    }
  }
  const specificDate = new Date();
  const year = specificDate.getFullYear();
  const month = specificDate.getMonth();
  const day = specificDate.getDate();

  const date = `${year}-${month + 1}-${day}`;

  let order_id = "GID" + makeid(4) + "S";

  const htmlFilePath = path.join(__dirname, "../../views/invoice.ejs");
  const generatedInvoiceNumber = generateInvoiceNumber(8);

  const pdfFileName = `invoice_${order_id}.pdf`;

  const htmlContent = fs.readFileSync(htmlFilePath, "utf-8");
  const renderedHTML = ejs.render(htmlContent, {
    email,
    userOrders,
    user,
    generatedInvoiceNumber,
    date,
  });

  const pdfOutputPath = path.join(
    __dirname,
    `../../public/invoice/${pdfFileName}`
  );

  generatePDFFromHTML(renderedHTML, pdfOutputPath, pdfFileName);
};

module.exports = generateInvoice;
