const router = require("express").Router();
const ctrl = require("../controllers/order.controller");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/order.validators");
const { asyncHandler } = require("../middleware/errorHandler");

router.post(
  "/",
  verifyToken,
  validate(v.createOrder),
  asyncHandler(ctrl.placeOrder),
);
router.get("/", verifyToken, asyncHandler(ctrl.listOrders));
router.get("/:order_id", verifyToken, asyncHandler(ctrl.getOrder));
// Public tracking — no auth needed, buyer just needs the order ID or number
router.get("/:order_id/tracking", asyncHandler(ctrl.getTracking));

module.exports = router;