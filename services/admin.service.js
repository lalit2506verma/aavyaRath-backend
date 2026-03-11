const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const { sendEmail, templates } = require("./email.service");
const { ghostOrderFilter } = require("./order.service");

const makeId = (prefix) =>
  `${prefix}_${uuidv4().replace(/-/g, "").slice(0, 12)}`;
const notFound = (what) => {
  const e = new Error(`${what} not found`);
  e.status = 404;
  return e;
};

// ── Dashboard ────────────────────────────────────────────

const getDashboardStats = async () => {
  const [totalOrders, pendingOrders, totalCustomers, lowStock, revenueResult] =
    await Promise.all([
      Order.countDocuments(ghostOrderFilter),
      Order.countDocuments({ ...ghostOrderFilter, fulfillment_status: "pending" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({
        $expr: { $lte: ["$stock", "$low_stock_threshold"] },
      }),
      Order.aggregate([
        { $match: { payment_status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

  return {
    total_revenue: revenueResult[0]?.total || 0,
    total_orders: totalOrders,
    pending_orders: pendingOrders,
    total_customers: totalCustomers,
    low_stock_alerts: lowStock,
  };
};

// ── Orders ───────────────────────────────────────────────

const getOrders = async ({ status, page, limit }) => {
  // Always exclude ghost orders (online payment started but never completed)
  const query = { ...ghostOrderFilter };
  if (status) query.fulfillment_status = status;
  const skip = (page - 1) * limit;
  const [total, orders] = await Promise.all([
    Order.countDocuments(query),
    Order.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
  ]);
  return { orders, total, page, pages: Math.ceil(total / limit) };
}; 

/**
 * updateOrderStatus(order_id, { status, tracking_number, courier_partner, estimated_delivery, note })
 *
 * Flow:
 *  1. Validate the status transition
 *  2. Update order in DB (tracking info + status + history entry)
 *  3. Send status update email to the customer
 *
 * The buyer can then see the new status and tracking number
 * any time they view the order or use the tracking endpoint.
 */
const updateOrderStatus = async (
  order_id,
  { status, tracking_number, courier_partner, estimated_delivery, note },
) => {
  const order = await Order.findOne({ order_id });
  if (!order) throw notFound("Order");

  // Guard: once delivered or cancelled, the status is locked
  if (["delivered", "cancelled"].includes(order.fulfillment_status)) {
    const e = new Error(
      `Order is already ${order.fulfillment_status} and cannot be changed`,
    );
    e.status = 400;
    throw e;
  }

  // Update order fields
  order.fulfillment_status = status;
  if (tracking_number) order.tracking_number = tracking_number;
  if (courier_partner) order.courier_partner = courier_partner;
  if (estimated_delivery)
    order.estimated_delivery = new Date(estimated_delivery);

  // Push to status history so the buyer sees a full timeline
  order.status_history.push({
    status,
    note: note || null,
    changed_at: new Date(),
  });

  await order.save();

  // Send email notification to buyer
  const customer = await User.findOne({ user_id: order.user_id }).lean();
  if (customer?.email) {
    const { subject, html } = templates.orderStatusUpdate({
      user: customer,
      order: order.toObject(),
    });
    sendEmail({ to: customer.email, subject, html }); // fire-and-forget
  }

  return { order_id, fulfillment_status: status };
};

// ── Products ─────────────────────────────────────────────

const getProducts = async ({ status, category_id, page, limit }) => {
  const query = {};
  if (status) query.status = status;
  if (category_id) query.category_id = category_id;
  const skip = (page - 1) * limit;
  const [total, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
  ]);
  return { products, total, page, pages: Math.ceil(total / limit) };
};

const createProduct = async (data) => {
  const duplicate = await Product.findOne({
    $or: [{ slug: data.slug }, { sku: data.sku }],
  });
  if (duplicate) {
    const field = duplicate.slug === data.slug ? "slug" : "SKU";
    const e = new Error(`A product with this ${field} already exists`);
    e.status = 409;
    throw e;
  }
  const product = await Product.create({ product_id: makeId("prod"), ...data });
  return { product_id: product.product_id };
};

const updateProduct = async (product_id, data) => {
  const result = await Product.updateOne({ product_id }, { $set: data });
  if (result.matchedCount === 0) throw notFound("Product");
};

const deleteProduct = async (product_id) => {
  const result = await Product.deleteOne({ product_id });
  if (result.deletedCount === 0) throw notFound("Product");
};

// ── Categories ───────────────────────────────────────────

const getCategories = async () => Category.find().lean();

const createCategory = async (data) => {
  const exists = await Category.findOne({ slug: data.slug });
  if (exists) {
    const e = new Error("A category with this slug already exists");
    e.status = 409;
    throw e;
  }
  const cat = await Category.create({ category_id: makeId("cat"), ...data });
  return { category_id: cat.category_id };
};

const updateCategory = async (category_id, data) => {
  const result = await Category.updateOne({ category_id }, { $set: data });
  if (result.matchedCount === 0) throw notFound("Category");
};

const deleteCategory = async (category_id) => {
  const productCount = await Product.countDocuments({ category_id });
  if (productCount > 0) {
    const e = new Error(
      `This category has ${productCount} product(s). Reassign or delete them first.`,
    );
    e.status = 400;
    throw e;
  }
  const result = await Category.deleteOne({ category_id });
  if (result.deletedCount === 0) throw notFound("Category");
};

// ── Customers ────────────────────────────────────────────

const getCustomers = async ({ page, limit }) => {
  const skip = (page - 1) * limit;
  const [total, customers] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.find({ role: "customer" }, { password_hash: 0 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const enriched = await Promise.all(
    customers.map(async (c) => {
      const orders = await Order.find(
        { user_id: c.user_id },
        { total: 1 },
      ).lean();
      return {
        ...c,
        total_orders: orders.length,
        total_spent: orders.reduce((s, o) => s + (o.total || 0), 0),
      };
    }),
  );

  return { customers: enriched, total, page, pages: Math.ceil(total / limit) };
};

// ── Coupons ──────────────────────────────────────────────

const getCoupons = async () => Coupon.find().lean();

const createCoupon = async (data) => {
  const exists = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (exists) {
    const e = new Error("A coupon with this code already exists");
    e.status = 409;
    throw e;
  }
  const coupon = await Coupon.create({ coupon_id: makeId("coupon"), ...data });
  return { coupon_id: coupon.coupon_id };
};

const deleteCoupon = async (coupon_id) => {
  const result = await Coupon.deleteOne({ coupon_id });
  if (result.deletedCount === 0) throw notFound("Coupon");
};

module.exports = {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCustomers,
  getCoupons,
  createCoupon,
  deleteCoupon,
};
