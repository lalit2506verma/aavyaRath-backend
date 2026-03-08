const mongoose = require("mongoose");

const SpecSchema = new mongoose.Schema(
  { key: String, value: String },
  { _id: false },
);

const ProductSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true },
    short_description: String,
    description: String,
    images: [String],
    category_id: { type: String, required: true, index: true },
    tags: [String],
    price: { type: Number, required: true },
    compare_at_price: Number,
    cost_price: Number,
    stock: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 5 },
    specifications: [SpecSchema],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    is_featured: { type: Boolean, default: false },
    is_new_arrival: { type: Boolean, default: false },
    is_sale: { type: Boolean, default: false },
    rating_average: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    sales_count: { type: Number, default: 0 },
    meta_title: String,
    meta_description: String,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Product", ProductSchema);