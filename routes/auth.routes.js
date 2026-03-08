const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/auth.validators");
const { asyncHandler } = require("../middleware/errorHandler");

router.post("/register", validate(v.register), asyncHandler(ctrl.register));
router.post("/login", validate(v.login), asyncHandler(ctrl.login));
router.get("/me", verifyToken, asyncHandler(ctrl.getMe));
router.post("/session", asyncHandler(ctrl.exchangeSession));
router.post(
  "/forgot-password",
  validate(v.forgotPassword),
  asyncHandler(ctrl.forgotPassword),
);
router.post(
  "/reset-password",
  validate(v.resetPassword),
  asyncHandler(ctrl.resetPassword),
);

module.exports = router;