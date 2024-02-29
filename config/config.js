// Productions mode

require("dotenv").config();

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
