const router = require("express").Router();
const ctrl = require("../controllers/payment.controller");
const { verifyToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.post("/create-order", verifyToken, asyncHandler(ctrl.createOrder));
router.post("/verify", verifyToken, asyncHandler(ctrl.verifyPayment));

module.exports = router;