const multer = require("multer");
const path = require("path");
const fs = require("fs");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = ""; // Define the upload path
    
    if (file.fieldname === "product_images") {
      uploadPath = path.join(__dirname, "../public/product");
    } else if (file.fieldname === "profile") {
      uploadPath = path.join(__dirname, "../../public/profile");
    } else if (file.fieldname === "category_image") {
      uploadPath = path.join(__dirname, "../public/category");
    } else if (file.fieldname === "subcategory_image") {
      uploadPath = path.join(__dirname, "../public/subcategory");
    } else {
      console.log(`multer problem ${file.fieldname}`);
      return cb(new Error("Invalid fieldname"));
    }

    // Use fs module to create the folder
    fs.mkdir(uploadPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating folder:', err);
        return cb(err);
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5000000, // 5000000 Bytes = 5 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      // upload only png and jpg format
      return cb(new Error("Please upload an Image"));
    }
    cb(null, true);
  },
});

module.exports = { upload };
