const Joi = require("joi");

// Shared address schema — used in order creation and user addresses
const address = Joi.object({
  label: Joi.string().trim().max(50).default("Home"),
  full_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({ "any.required": "Full name is required" }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Please enter a valid 10-digit Indian mobile number",
      "any.required": "Phone number is required",
    }),
  line1: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({ "any.required": "Address line 1 is required" }),
  line2: Joi.string().trim().max(200).optional().allow(""),
  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({ "any.required": "City is required" }),
  state: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({ "any.required": "State is required" }),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Pincode must be exactly 6 digits",
      "any.required": "Pincode is required",
    }),
  country: Joi.string().trim().max(100).default("India"),
  is_default: Joi.boolean().default(false),
});

const createOrder = Joi.object({
  shipping_address: address.required(),
  payment_method: Joi.string()
    .valid("cod", "razorpay", "upi", "netbanking", "card")
    .required()
    .messages({ "any.required": "Payment method is required" }),
  coupon_code: Joi.string().trim().uppercase().max(30).optional().allow(""),
});

const addToCart = Joi.object({
  product_id: Joi.string()
    .required()
    .messages({ "any.required": "product_id is required" }),
  quantity: Joi.number().integer().min(1).max(20).default(1).messages({
    "number.max": "Cannot add more than 20 of the same item at once",
  }),
});

const updateCartItem = Joi.object({
  quantity: Joi.number().integer().min(0).max(20).required().messages({
    "any.required": "quantity is required",
  }),
});

module.exports = { address, createOrder, addToCart, updateCartItem };
