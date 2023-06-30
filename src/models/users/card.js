const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const product = require("./product");
const user = require("../auth/register");

const card = sequelize.define("card", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
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
  as: "cards", // Provide a unique alias for the association
});
card.belongsTo(product, {
  foreignKey: "productId",
  as: "product", // Provide a unique alias for the association
});

// user
user.hasMany(card, {
  foreignKey: "userId",
  as: "cards",
});
card.belongsTo(user, {
  foreignKey: "userId",
  as: "user",
});

card.sync();
module.exports = card;
