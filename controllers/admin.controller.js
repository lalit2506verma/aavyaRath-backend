const adminService = require("../services/admin.service");

// ── Dashboard ────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
};

// ── Orders ───────────────────────────────────────────────
const listOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const result = await adminService.getOrders({
    status,
    page: Number(page),
    limit: Number(limit),
  });
  res.json(result);
};

const updateOrderStatus = async (req, res) => {
  const result = await adminService.updateOrderStatus(
    req.params.order_id,
    req.body,
  );
  res.json({ message: "Order status updated", ...result });
};

// ── Products ─────────────────────────────────────────────
const listProducts = async (req, res) => {
  const { status, category_id, page = 1, limit = 20 } = req.query;
  const result = await adminService.getProducts({
    status,
    category_id,
    page: Number(page),
    limit: Number(limit),
  });
  res.json(result);
};

const createProduct = async (req, res) => {
  const result = await adminService.createProduct(req.body);
  res.status(201).json({ message: "Product created", ...result });
};

const updateProduct = async (req, res) => {
  await adminService.updateProduct(req.params.product_id, req.body);
  res.json({ message: "Product updated" });
};

const deleteProduct = async (req, res) => {
  await adminService.deleteProduct(req.params.product_id);
  res.json({ message: "Product deleted" });
};

// ── Categories ───────────────────────────────────────────
const listCategories = async (req, res) => {
  const categories = await adminService.getCategories();
  res.json(categories);
};

const createCategory = async (req, res) => {
  const result = await adminService.createCategory(req.body);
  res.status(201).json({ message: "Category created", ...result });
};

const updateCategory = async (req, res) => {
  await adminService.updateCategory(req.params.category_id, req.body);
  res.json({ message: "Category updated" });
};

const deleteCategory = async (req, res) => {
  await adminService.deleteCategory(req.params.category_id);
  res.json({ message: "Category deleted" });
};

// ── Customers ────────────────────────────────────────────
const listCustomers = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await adminService.getCustomers({
    page: Number(page),
    limit: Number(limit),
  });
  res.json(result);
};

// ── Coupons ──────────────────────────────────────────────
const listCoupons = async (req, res) => {
  const coupons = await adminService.getCoupons();
  res.json(coupons);
};

const createCoupon = async (req, res) => {
  const result = await adminService.createCoupon(req.body);
  res.status(201).json({ message: "Coupon created", ...result });
};

const deleteCoupon = async (req, res) => {
  await adminService.deleteCoupon(req.params.coupon_id);
  res.json({ message: "Coupon deleted" });
};

module.exports = {
  getDashboardStats,
  listOrders,
  updateOrderStatus,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listCustomers,
  listCoupons,
  createCoupon,
  deleteCoupon,
};