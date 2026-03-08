const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const { sendEmail, templates } = require("./email.service");

const makeOrderId = () => `order_${uuidv4().replace(/-/g, "").slice(0, 12)}`;
const makeOrderNumber = () =>
  `AH${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${uuidv4().replace(/-/g, "").slice(0, 6).toUpperCase()}`;

/**
 * applyCoupon(coupon, subtotal)
 * Returns the discount amount. Throws if coupon is invalid for this order.
 */
const applyCoupon = async (coupon_code, subtotal) => {
  if (!coupon_code) return { discount: 0, free_shipping: false };

  const coupon = await Coupon.findOne({
    code: coupon_code.toUpperCase(),
    is_active: true,
    valid_from: { $lte: new Date() },
    valid_to: { $gte: new Date() },
  });

  if (!coupon) {
    const e = new Error("Coupon code is invalid or expired");
    e.status = 400;
    throw e;
  }
  if (subtotal < coupon.min_order_value) {
    const e = new Error(
      `This coupon requires a minimum order of ₹${coupon.min_order_value}`,
    );
    e.status = 400;
    throw e;
  }

  let discount = 0;
  let free_shipping = false;

  if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.max_discount_cap)
      discount = Math.min(discount, coupon.max_discount_cap);
  } else if (coupon.type === "flat") {
    discount = coupon.value;
  } else if (coupon.type === "freeshipping") {
    free_shipping = true;
  }

  // Increment usage count
  coupon.usage_count = (coupon.usage_count || 0) + 1;
  await coupon.save();

  return { discount: Math.round(discount * 100) / 100, free_shipping };
};

/**
 * placeOrder(user, orderData)
 * Main order placement: validates stock, calculates totals,
 * saves order, clears cart, sends confirmation email.
 */
const placeOrder = async (
  user,
  { shipping_address, payment_method, coupon_code },
) => {
  const cart = await Cart.findOne({ user_id: user.user_id });
  if (!cart || cart.items.length === 0) {
    const e = new Error("Your cart is empty");
    e.status = 400;
    throw e;
  }

  // Build items list and check stock for each
  const items = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = await Product.findOne({ product_id: cartItem.product_id });
    if (!product) continue;

    if (product.stock < cartItem.quantity) {
      const e = new Error(
        `"${product.name}" only has ${product.stock} unit(s) left in stock`,
      );
      e.status = 400;
      throw e;
    }

    const item_total = product.price * cartItem.quantity;
    items.push({
      product_id: product.product_id,
      name: product.name,
      image: product.images?.[0] || null,
      price: product.price,
      quantity: cartItem.quantity,
      total: item_total,
    });
    subtotal += item_total;

    // Deduct stock immediately
    product.stock -= cartItem.quantity;
    product.sales_count = (product.sales_count || 0) + cartItem.quantity;
    await product.save();
  }

  if (items.length === 0) {
    const e = new Error("No valid items in cart");
    e.status = 400;
    throw e;
  }

  // Shipping: free above ₹999
  let shipping_cost = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST

  // Apply coupon
  const { discount, free_shipping } = await applyCoupon(coupon_code, subtotal);
  if (free_shipping) shipping_cost = 0;

  const total = subtotal + shipping_cost + tax - discount;

  const order = await Order.create({
    order_id: makeOrderId(),
    order_number: makeOrderNumber(),
    user_id: user.user_id,
    items,
    shipping_address,
    payment_method,
    payment_status: "pending",
    fulfillment_status: "pending",
    // Record the initial status in the history timeline
    status_history: [{ status: "pending", note: "Order placed by customer" }],
    subtotal,
    shipping_cost,
    tax,
    discount,
    total,
    coupon_code: coupon_code || null,
  });

  // Clear cart after successful order
  await Cart.deleteOne({ user_id: user.user_id });

  // Send confirmation email (non-blocking — failure won't affect the response)
  const { subject, html } = templates.orderConfirmation({
    user,
    order: order.toObject(),
  });
  sendEmail({ to: user.email, subject, html });

  return { order_id: order.order_id, order_number: order.order_number, total };
};

const getOrders = async (user_id, { status, page, limit }) => {
  const query = { user_id };
  if (status) query.fulfillment_status = status;
  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return { orders, total, page, pages: Math.ceil(total / limit) };
};

const getOrderById = async (order_id, user_id) => {
  const order = await Order.findOne({ order_id, user_id }).lean();
  if (!order) {
    const e = new Error("Order not found");
    e.status = 404;
    throw e;
  }
  return order;
};

/**
 * getTracking(order_id)
 * Public endpoint — returns status + tracking info without auth.
 * The buyer just needs to know their order_id or order_number.
 */
const getTracking = async (order_id) => {
  const order = await Order.findOne({
    $or: [{ order_id }, { order_number: order_id }],
  }).lean();

  if (!order) {
    const e = new Error("Order not found");
    e.status = 404;
    throw e;
  }

  return {
    order_number: order.order_number,
    fulfillment_status: order.fulfillment_status,
    tracking_number: order.tracking_number || null,
    courier_partner: order.courier_partner || null,
    estimated_delivery: order.estimated_delivery || null,
    status_history: order.status_history || [],
    items: order.items,
    created_at: order.created_at,
  };
};

module.exports = { placeOrder, getOrders, getOrderById, getTracking };