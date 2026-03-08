const router = require("express").Router();
const ctrl = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../validators/user.validators");
const { address } = require("../validators/order.validators");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(verifyToken);

router.get("/profile", asyncHandler(ctrl.getProfile));
router.patch(
  "/profile",
  validate(v.updateProfile),
  asyncHandler(ctrl.updateProfile),
);
router.get("/addresses", asyncHandler(ctrl.getAddresses));
router.post("/addresses", validate(address), asyncHandler(ctrl.addAddress));
router.delete("/addresses/:address_id", asyncHandler(ctrl.deleteAddress));
router.patch(
  "/change-password",
  validate(v.changePassword),
  asyncHandler(ctrl.changePassword),
);

module.exports = router;