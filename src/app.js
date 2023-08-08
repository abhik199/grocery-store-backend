const { url, PORT } = require("../config/config");
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(morgan("tiny"));

const port = process.env.PORT || PORT;
const { connect } = require("../config/database");

app.use(
  cors({
    // origin: url,    // when use p
    exposedHeaders: ["X-Total-Count"], // for pagination
  })
);

// when Server deploy use this type "../public"
app.use(express.static("public"));

// Api Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

app.use(require("../config/errorHandler"));

app.set("views", path.join("../views"));
app.set("view engine", "ejs");

connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Server running failed`);
  });
