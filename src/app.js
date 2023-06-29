require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("tiny"));

const PORT = process.env.PORT || 4500;
const { connect } = require("../config/database");

// app.use(
//   cors({
//     origin: "http://localhost:4500",
//   })
// );
app.use(cors());
app.use(express.static("public"));

// Api Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

app.use(require("../config/errorHandler"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server running failed`);
  });
