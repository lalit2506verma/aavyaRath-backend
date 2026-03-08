const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    product_id: String,
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    total: Number,
  },
  {
    _id: false,
  },
);

const AddressSchema = new mongoose.Schema(
  {
    label: String,
    full_name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  { _id: false },
);

// Each time admin updates the order status, we push an entry here.
// This gives the buyer a full timeline of their order.
const StatusHistorySchema = new mongoose.Schema(
  {
    status: String,
    note: String, // optional note from admin (e.g. "Packed and ready for pickup")
    changed_at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true, index: true },
    order_number: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, index: true },
    items: [OrderItemSchema],
    shipping_address: AddressSchema,
    payment_method: String,
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    fulfillment_status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    // Status history so the buyer can see a full timeline
    status_history: [StatusHistorySchema],
    // Shipping / tracking info — set by admin when marking as shipped
    tracking_number: String,
    courier_partner: String, // e.g. "Delhivery", "BlueDart", "DTDC"
    estimated_delivery: Date, // optional — admin can set this
    subtotal: Number,
    shipping_cost: Number,
    tax: Number,
    discount: Number,
    total: Number,
    coupon_code: String,
    notes: String,
    razorpay_order_id: String,
    razorpay_payment_id: String,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Order", OrderSchema);