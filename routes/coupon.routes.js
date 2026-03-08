const router = require("express").Router();
const ctrl = require("../controllers/coupon.controller");
const { verifyTokenOptional } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { validateCoupon } = require("../validators/admin.validators");
const { asyncHandler } = require("../middleware/errorHandler");

router.post(
  "/validate",
  verifyTokenOptional,
  validate(validateCoupon),
  asyncHandler(ctrl.validateCoupon),
);

module.exports = router;