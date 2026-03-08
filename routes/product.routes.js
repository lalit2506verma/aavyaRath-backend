const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/product.validators");
const { asyncHandler } = require("../middleware/errorHandler");

// Important: specific routes must come BEFORE /:slug so they don't get swallowed
router.get("/featured", asyncHandler(ctrl.featured));
router.get("/new-arrivals", asyncHandler(ctrl.newArrivals));
router.get("/bestsellers", asyncHandler(ctrl.bestsellers));

router.get("/", validate(v.listQuery, "query"), asyncHandler(ctrl.list));
router.get("/:slug", asyncHandler(ctrl.getBySlug));
router.get("/:product_id/related", asyncHandler(ctrl.related));
router.post(
  "/:product_id/reviews",
  verifyToken,
  validate(v.review),
  asyncHandler(ctrl.submitReview),
);

module.exports = router;