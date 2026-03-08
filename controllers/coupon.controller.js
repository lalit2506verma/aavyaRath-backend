const couponService = require("../services/coupon.service");

const validateCoupon = async (req, res) => {
  const result = await couponService.validateCoupon(
    req.body.code,
    req.body.cart_total,
  );
  res.json(result);
};

module.exports = { validateCoupon };