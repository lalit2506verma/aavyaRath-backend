const Joi = require("joi");

const contactForm = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required(),
  subject: Joi.string().trim().min(3).max(200).required(),
  message: Joi.string().trim().min(10).max(3000).required().messages({
    "string.min": "Message must be at least 10 characters",
  }),
});

const newsletter = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required(),
});

module.exports = { contactForm, newsletter };