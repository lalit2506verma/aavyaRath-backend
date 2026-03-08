const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const CartSchema = new mongoose.Schema(
  {
    cart_id: { type: String, required: true, unique: true },
    user_id: { type: String, index: true }, // null for guest carts
    items: [CartItemSchema],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Cart", CartSchema);