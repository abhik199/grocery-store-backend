

const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const path = require("path");
const { connect } = require("../config/database");

const port = process.env.PORT || 6900;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("dev"));

app.use(cors());

app.use(express.static("public"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.get("*", async (req, res) => {
  res.send("404 Api is not found");
});

app.use(require("../config/errorHandler"));
app.set("views", path.join("../views"));
app.set("view engine", "ejs");

connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server Running here 👉${port}/`);
    });
  })
  .catch((err) => {
    console.log(`Server running failed`);
  });
