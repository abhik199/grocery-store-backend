// Productions mode

require("dotenv").config();

// module.exports = {
//   PORT: 6900,
//   DB_HOST: "localhost",
//   email: "abhishekkirar2004@gmail.com",
//   password: "gljmyxpeqmmdwwew",
//   JWT_SECRET: "thisismyjwtsecretisvrygood",
//   REFRESH_SECRET: "thisismyrefreshtokenlogiv",
//   url: "http://http://103.154.184.14:6900",

//   // payment mode
//   key_id: "rzp_test_RoNhb5DAFJojWp",
//   Key_Secret: "dLPNbIlQyfNP1tW02KkrCmFx",

//   DB_NAME: "deepasoft_grocery",
//   DB_USERNAME: "deepasoft_grocer_mart",
//   DB_PASSWORD: "AE@Q555r$tK8",
//   DEBUG_MODE: true,
// };

// Development mode
// config.js
module.exports = {
  DB_HOST: process.env.DB_HOST,
  email: process.env.email,
  password: process.env.password,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  url: process.env.url,
  key_id: process.env.key_id,
  Key_Secret: process.env.Key_Secret,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DEBUG_MODE: process.env.DEBUG_MODE === "true",
};

// Testing mode
