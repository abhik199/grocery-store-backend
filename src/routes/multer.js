// import multer from "multer";
// import path from "path";
const multer = require("multer");
const path = require("path");

const fileStorage = multer.diskStorage({
  //   destination: "./public/product",
  destination: (req, file, cb) => {
    if (file.fieldname === "product_images" || file.fieldname === "thumbnail") {
      cb(null, path.join(process.cwd(), "public/product"));
    } else if (file.fieldname === "profile") {
      cb(null, path.join(process.cwd(), "public/profile"));
    } else if (file.fieldname === "icon") {
      cb(null, path.join(process.cwd(), "public/icons"));
    } else {
      console.log(`multer problem ${file.fieldname}`);
    }
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

exports.imageUpload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5000000, // 5000000 Bytes = 5 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});
