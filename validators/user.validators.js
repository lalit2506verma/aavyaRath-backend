const Joi = require("joi");

const updateProfile = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Please enter a valid 10-digit Indian mobile number",
    }),
  date_of_birth: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Date of birth must be a valid date (YYYY-MM-DD)",
  }),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

const changePassword = Joi.object({
  old_password: Joi.string()
    .required()
    .messages({ "any.required": "Current password is required" }),
  new_password: Joi.string()
    .min(8)
    .max(72)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[0-9]/, "number")
    .disallow(Joi.ref("old_password"))
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters",
      "string.pattern.name":
        "Password must contain at least one {#name} letter and one number",
      "any.invalid":
        "New password must be different from your current password",
    }),
});

module.exports = { updateProfile, changePassword };