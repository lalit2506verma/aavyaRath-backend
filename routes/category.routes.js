const router = require("express").Router();
const ctrl = require("../controllers/category.controller");
const { asyncHandler } = require("../middleware/errorHandler");

router.get("/", asyncHandler(ctrl.list));
router.get("/:slug", asyncHandler(ctrl.getBySlug));

module.exports = router;