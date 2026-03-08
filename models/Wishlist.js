const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    product_ids: [String],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
