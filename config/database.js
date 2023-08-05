const { Sequelize } = require("sequelize");
const { DB_NAME, DB_PASSWORD, DB_USERNAME, DB_HOST } = require("./config");

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

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
