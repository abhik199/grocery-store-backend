const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const Users = require("./register");

const Addresses = sequelize.define("addresses", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  full_name: {
    type: DataTypes.STRING,
  },
  contact: {
    type: DataTypes.STRING,
  },
  country: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  post_code: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  address_type: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: Users,
      key: "id",
    },
  },
});

Addresses.sync();

Users.hasMany(Addresses, {
  foreignKey: "userId",
});
Addresses.belongsTo(Users, {
  foreignKey: "userId",
});

module.exports = Addresses;
