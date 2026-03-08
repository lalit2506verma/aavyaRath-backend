const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    address_id: String,
    label: { type: String, default: "Home" },
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    is_default: { type: Boolean, default: false },
  },
  {
    _id: false,
  },
);

const UserSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: { type: String, required: true },
    phone: String,
    password_hash: String,
    role: {
      type: String,
      enum: ["customer", "admin", "superadmin"],
      default: "customer",
    },
    profile_image: String,
    saved_addresses: [AddressSchema],
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("User", UserSchema)