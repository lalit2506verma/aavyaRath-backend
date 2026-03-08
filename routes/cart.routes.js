const router = require("express").Router();
const ctrl = require("../controllers/cart.controller");
const { verifyToken, verifyTokenOptional } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/order.validators");
const { asyncHandler } = require("../middleware/errorHandler");

router.get("/", verifyTokenOptional, asyncHandler(ctrl.getCart));
router.post(
  "/add",
  verifyTokenOptional,
  validate(v.addToCart),
  asyncHandler(ctrl.addItem),
);
router.patch(
  "/:product_id",
  verifyToken,
  validate(v.updateCartItem),
  asyncHandler(ctrl.updateItem),
);
router.delete("/:product_id", verifyToken, asyncHandler(ctrl.removeItem));

module.exports = router;