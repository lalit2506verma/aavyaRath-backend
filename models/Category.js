const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    category_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    description_long: String,
    image: String,
    parent_category: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Category", CategorySchema);
