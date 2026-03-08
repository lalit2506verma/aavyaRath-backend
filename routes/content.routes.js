const router = require("express").Router();
const ctrl = require("../controllers/content.controller");
const validate = require("../middleware/validate");
const v = require("../validators/content.validators");
const { asyncHandler } = require("../middleware/errorHandler");

router.post(
  "/contact",
  validate(v.contactForm),
  asyncHandler(ctrl.submitContact),
);
router.post(
  "/newsletter",
  validate(v.newsletter),
  asyncHandler(ctrl.subscribe),
);
router.get("/faqs", asyncHandler(ctrl.getFaqs));
router.get("/blog", asyncHandler(ctrl.getBlogPosts));
router.get("/blog/:slug", asyncHandler(ctrl.getBlogPost));

module.exports = router;