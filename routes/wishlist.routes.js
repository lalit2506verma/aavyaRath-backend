const router = require("express").Router();
const ctrl = require("../controllers/wishlist.controller");
const { verifyToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(verifyToken);
router.get("/", asyncHandler(ctrl.getWishlist));
router.post("/:product_id", asyncHandler(ctrl.addToWishlist));
router.delete("/:product_id", asyncHandler(ctrl.removeFromWishlist));

module.exports = router;