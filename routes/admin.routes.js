const router = require("express").Router();
const ctrl = require("../controllers/admin.controller");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/admin.validators");
const {
  createProduct,
  updateProduct,
} = require("../validators/product.validators");
const { asyncHandler } = require("../middleware/errorHandler");

// All admin routes require auth + admin role
router.use(verifyToken, requireAdmin);

// Dashboard
router.get("/dashboard/stats", asyncHandler(ctrl.getDashboardStats));

// Orders
router.get("/orders", asyncHandler(ctrl.listOrders));
router.patch(
  "/orders/:order_id/status",
  validate(v.updateOrderStatus),
  asyncHandler(ctrl.updateOrderStatus),
);

// Products
router.get("/products", asyncHandler(ctrl.listProducts));
router.post(
  "/products",
  validate(createProduct),
  asyncHandler(ctrl.createProduct),
);
router.put(
  "/products/:product_id",
  validate(updateProduct),
  asyncHandler(ctrl.updateProduct),
);
router.delete("/products/:product_id", asyncHandler(ctrl.deleteProduct));

// Categories
router.get("/categories", asyncHandler(ctrl.listCategories));
router.post(
  "/categories",
  validate(v.createCategory),
  asyncHandler(ctrl.createCategory),
);
router.put(
  "/categories/:category_id",
  validate(v.updateCategory),
  asyncHandler(ctrl.updateCategory),
);
router.delete("/categories/:category_id", asyncHandler(ctrl.deleteCategory));

// Customers
router.get("/customers", asyncHandler(ctrl.listCustomers));

// Coupons
router.get("/coupons", asyncHandler(ctrl.listCoupons));
router.post(
  "/coupons",
  validate(v.createCoupon),
  asyncHandler(ctrl.createCoupon),
);
router.delete("/coupons/:coupon_id", asyncHandler(ctrl.deleteCoupon));

module.exports = router;