const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    review_id: { type: String, required: true, unique: true },
    product_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true },
    user_name: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    body: { type: String, required: true },
    is_verified_purchase: { type: Boolean, default: false },
    helpful_votes: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Prevent one user from reviewing the same product twice
ReviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
