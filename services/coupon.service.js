const Coupon = require("../models/Coupon");

const validateCoupon = async (code, cart_total) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), is_active: true }).lean();
  if (!coupon) {
    const e = new Error("Invalid coupon code");
    e.status = 400;
    throw e;
  }

  const now = new Date();
  if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_to)) {
    const e = new Error("This coupon has expired");
    e.status = 400;
    throw e;
  }

  if (cart_total < coupon.min_order_value) {
    const e = new Error(`This coupon requires a minimum order of ${coupon.min_order_value}`);
    e.status = 400;
    throw e;
  }

  let discount = 0;
  let free_shipping = false;

  if (coupon.type === "percentage") {
    discount = (cart_total * coupon.value) / 100;
    if (coupon.max_discount_cap) discount = Math.min(discount, coupon.max_discount_cap);
  }
  else if (coupon.type === "flat") {
    discount = coupon.value;
  }
  else if (coupon.type === "freeshipping") {
    free_shipping = true;
  }

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discount: Math.round(discount * 100) / 100,
    free_shipping,
    message: free_shipping
      ? "Coupon applied! Free shipping on this order."
      : `Coupon applied! You save ₹${Math.round(discount * 100) / 100}`,
  };
};

module.exports = { validateCoupon };