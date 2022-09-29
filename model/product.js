const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxlength: [120, "Product name cannot be greater than 120 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please enter price for product"],
    maxlength: [5, "Product price should not be more than 5 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provide product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  categories: {
    type: String,
    required: [
      true,
      "Please provide product category from shortsleeves, longsleeves, sweatshirts, hoodies",
    ],
    enum: {
      values: ["short-sleeves", "long-sleeves", "sweat-shirts", "hoodies"],
      message:
        "Please select product category only from short-sleeves, long-sleeves, sweat-shirts, hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "Please provide brand name"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stock: {
    type: Number,
    required: [true, "Please enter stock of product"],
    default: 0,
  },
});

module.exports = mongoose.model("Product", productSchema);
