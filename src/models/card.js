const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const product = require("./product");
const user = require("./auth/register");

const card = sequelize.define("card", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  thumbnail: {
    type: DataTypes.STRING,
  },
  discount_price: {
    type: DataTypes.FLOAT,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
  subtotal: {
    type: DataTypes.FLOAT,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: product,
      key: "id",
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: user,
      key: "id",
    },
  },
});

// product
product.hasMany(card, {
  foreignKey: "productId",
});
card.belongsTo(product, {
  foreignKey: "productId",
});

// user
user.hasMany(card, {
  foreignKey: "userId",
});
card.belongsTo(user, {
  foreignKey: "userId",
});

card.sync();
module.exports = card;
