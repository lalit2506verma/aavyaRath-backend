const crypto = require("crypto");
const RazorPay = require("razorpay");
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const { confirmOnlinePayment } = require("./order.service");

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

  const razorpay = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return razorpay.orders.create({
    amount: Number(amount),
    currency: "INR",
    receipt: order_id
      ? order_id.slice(0, 40)
      : `rcpt_${uuidv4().replace(/-/g, "").slice(0, 8)}`,
    payment_capture: 1,
  });
};

/**
 * verifyPayment(...)
 *
 * On success:
 *  1. Mark order payment_status → "completed"
 *  2. Deduct stock + clear cart (via confirmOnlinePayment)
 *  3. Send order confirmation email
 *
 * If the user never calls this (page refresh / tab close),
 * the order stays payment_status "pending" and is treated
 * as a ghost order — invisible to user and admin.
 */
const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  order_id,
  user_id,
}) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // Dev mode: just mark as paid
    await Order.updateOne(
      { order_id },
      { $set: { payment_status: "completed" } },
    );
    await confirmOnlinePayment(order_id, user_id);
    return;
  }

  // Verify Razorpay signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    const e = new Error("Invalid payment signature");
    e.status = 400;
    throw e;
  }

  // Mark order as paid
  await Order.updateOne(
    { order_id },
    {
      $set: {
        payment_status: "completed",
        razorpay_order_id,
        razorpay_payment_id,
      },
    },
  );

  await confirmOnlinePayment(order_id, user_id);
};

module.exports = { createPaymentOrder, verifyPayment };
