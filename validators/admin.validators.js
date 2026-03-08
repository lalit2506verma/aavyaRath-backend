const Joi = require("joi");

// ── Update order fulfillment status ─────────────────────
const updateOrderStatus = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .required()
    .messages({
      "any.only":
        "Status must be: pending, processing, shipped, delivered, or cancelled",
      "any.required": "Status is required",
    }),

  // Tracking info — required when status is "shipped"
  tracking_number: Joi.when("status", {
    is: "shipped",
    then: Joi.string().trim().max(100).required().messages({
      "any.required":
        "Tracking number is required when marking an order as shipped",
    }),
    otherwise: Joi.string().trim().max(100).optional().allow(""),
  }),

  courier_partner: Joi.string().trim().max(100).optional().allow("").messages({
    "string.max": "Courier partner name cannot exceed 100 characters",
  }),

  estimated_delivery: Joi.date().iso().min("now").optional().messages({
    "date.min": "Estimated delivery must be a future date",
  }),

  note: Joi.string().trim().max(500).optional().allow(""),
});

// ── Category ─────────────────────────────────────────────
const createCategory = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required()
    .messages({
      "string.pattern.base": "Slug must be lowercase with hyphens only",
    }),
  description: Joi.string().trim().max(500).optional(),
  description_long: Joi.string().trim().max(3000).optional(),
  image: Joi.string().uri().optional(),
  parent_category: Joi.string().optional(),
  status: Joi.string().valid("active", "inactive").default("active"),
});

const updateCategory = createCategory.fork(["name", "slug"], (f) =>
  f.optional(),
);

// ── Coupon ───────────────────────────────────────────────
const createCoupon = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.alphanum": "Coupon code can only contain letters and numbers",
      "any.required": "Coupon code is required",
    }),
  type: Joi.string().valid("percentage", "flat", "freeshipping").required(),
  value: Joi.when("type", {
    is: "freeshipping",
    then: Joi.number().default(0),
    otherwise: Joi.number().positive().required().messages({
      "any.required": "Discount value is required",
    }),
  }),
  min_order_value: Joi.number().min(0).default(0),
  max_discount_cap: Joi.when("type", {
    is: "percentage",
    then: Joi.number().positive().optional(),
    otherwise: Joi.optional(),
  }),
  usage_limit: Joi.number().integer().positive().optional(),
  usage_limit_per_user: Joi.number().integer().min(1).default(1),
  valid_from: Joi.date().iso().required(),
  valid_to: Joi.date()
    .iso()
    .greater(Joi.ref("valid_from"))
    .required()
    .messages({
      "date.greater": "Expiry date must be after the start date",
    }),
  applicable_categories: Joi.array().items(Joi.string()).default([]),
  is_active: Joi.boolean().default(true),
});

// ── Validate coupon at checkout ──────────────────────────
const validateCoupon = Joi.object({
  code: Joi.string().trim().required(),
  cart_total: Joi.number().min(0).default(0),
});

module.exports = {
  updateOrderStatus,
  createCategory,
  updateCategory,
  createCoupon,
  validateCoupon,
};