const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Db Connected");
  } catch (error) {
    console.log("db connection failed" + error);
  }
  return sequelize;
};

module.exports = { connect, sequelize };
