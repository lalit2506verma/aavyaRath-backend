const cryto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");

const createPaymentOrder = async ({ amount, order_id }) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    // Dev mode: return a mock RazorPay order
    return {
      id: `order_${uuidv4().replace(/-/g, "").slice(0, 12)}`,
      amount,
      currency: "INR",
      status: "created",
    };
  }

  const RazorPay = require("razorpay");
  const razorpay = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return razorpay.orders.create({
    amount: Number(amount),
    currency: "INR",
    receipt: order_id ? order_id.slice(0, 40) : `rcpt_${uuidv4().replace(/-/g, "").slice(0, 8)}`,
    payment_capture: 1,
  });
};

const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // Dev mode: just mark as paid
    await Order.updateOne({ order_id }, { $set: { payment_status: "Completed" } });
    return;
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  
  if (expected !== razorpay_signature) {
    const e = new Error("Invalid payment signature");
    e.status = 400;
    throw e;
  }

  await Order.updateOne(
    { order_id },
    { $set: { payment_status: "Completed", razorpay_order_id, razorpay_payment_id } }
  );
};

module.exports = { createPaymentOrder, verifyPayment };