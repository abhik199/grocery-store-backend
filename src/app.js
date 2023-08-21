const { url, PORT } = require("../config/config");
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const path = require("path");

// this is get current ip address
const ipAddressModule = require("./services/getip");
const ipAddress = ipAddressModule.ipAddress();

const Url = `https://${ipAddress}:${PORT}`;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// morgan code
morgan.token("complete-url", (req, res) => {
  const ipAddress = ipAddressModule.ipAddress();
  return `http://${ipAddress}:${PORT}${req.originalUrl}`;
});
app.use(morgan(":method :complete-url :status :response-time ms"));

const port = process.env.PORT || PORT;
const { connect } = require("../config/database");

app.use(
  cors({
    exposedHeaders: ["X-Total-Count"], // for pagination
  })
);

app.use(express.static("public"));

// Api Routes
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
      console.log(`Server Running here 👉${Url}/`);
    });
  })
  .catch((err) => {
    console.log(`Server running failed`);
  });
