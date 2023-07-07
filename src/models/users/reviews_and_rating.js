const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const User = require("../auth/register");
const Product = require("./product");

const ReviewsAndRating = sequelize.define("reviews_and_rating", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1, // Minimum value allowed is 1
      max: 5, // Maximum value allowed is 5
      isWithinRange(value) {
        if (value < 1 || value > 5) {
          throw new Error("Rating must be between 1 and 5 digits.");
        }
      },
    },
  },
  comment: {
    type: DataTypes.STRING,
  },
});
ReviewsAndRating.sync();

Product.belongsToMany(User, {
  through: ReviewsAndRating,
  foreignKey: "productId",
  as: "reviews", // Alias for the association in the Product model
});

User.belongsToMany(Product, {
  through: ReviewsAndRating,
  foreignKey: "userId",
  as: "reviews", // Alias for the association in the User model
});

module.exports = ReviewsAndRating;
