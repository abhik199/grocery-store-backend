const { Sequelize } = require("sequelize");
const env = require("./env/development");

const sequelize = new Sequelize(env.DB_NAME, env.DB_USERNAME, env.DB_PASSWORD, {
  host: env.DB_HOST,
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
