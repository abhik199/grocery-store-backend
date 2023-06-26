const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 4500;
const { connect } = require("../config/database");

app.use(
  cors({
    origin: "http://localhost:4500",
  })
);

// Api Routes

app.use("/auth", require("./routes/authRoutes"));
app.use("/product", require("./routes/userRoutes"));

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server running failed`);
  });
