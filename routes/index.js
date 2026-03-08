/**
 * routes/index.js
 * ─────────────────────────────────────────────────────────
 * Single place where every router is mounted.
 * server.js just does: app.use('/api', require('./routes'))
 */

const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/categories", require("./category.routes"));
router.use("/products", require("./product.routes"));
router.use("/cart", require("./cart.routes"));
router.use("/orders", require("./order.routes"));
router.use("/users", require("./user.routes"));
router.use("/wishlist", require("./wishlist.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/content", require("./content.routes"));
router.use("/payment", require("./payment.routes"));
router.use("/coupons", require("./coupon.routes"));
router.use("/upload", require("./upload.routes"));

// Seed endpoint (disable in production)
if (process.env.NODE_ENV !== "production") {
  router.use("/seed", require("./seed.routes"));
}

module.exports = router;
