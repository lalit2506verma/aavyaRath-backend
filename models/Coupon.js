const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    coupon_id: { type: String, required: true, unique: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["percentage", "flat", "freeshipping"],
      required: true,
    },
    value: { type: Number, default: 0 },
    min_order_value: { type: Number, default: 0 },
    max_discount_cap: Number,
    usage_limit: Number,
    usage_limit_per_user: { type: Number, default: 1 },
    usage_count: { type: Number, default: 0 },
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },
    applicable_categories: [String],
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Coupon", CouponSchema);
