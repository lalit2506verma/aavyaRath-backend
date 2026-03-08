const Joi = require("joi");

const register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .min(8)
    .max(72)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[0-9]/, "number")
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.name":
        "Password must contain at least one {#name} letter and one number",
      "any.required": "Password is required",
    }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Please enter a valid 10-digit Indian mobile number",
    }),
});

const login = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required(),
  password: Joi.string().required(),
});

const forgotPassword = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
});

const resetPassword = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().min(8).max(72).required(),
});

module.exports = { register, login, forgotPassword, resetPassword };