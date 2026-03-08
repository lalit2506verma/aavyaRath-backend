const Joi = require("joi");

const spec = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().required(),
});

const createProduct = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required()
    .messages({
      "string.pattern.base":
        "Slug must be lowercase letters, numbers, and hyphens only",
    }),
  sku: Joi.string().trim().uppercase().max(50).required(),
  short_description: Joi.string().trim().max(300).optional(),
  description: Joi.string().trim().max(5000).optional(),
  images: Joi.array().items(Joi.string().uri()).max(10).default([]),
  category_id: Joi.string().required(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).max(20).default([]),
  price: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Price must be greater than 0",
  }),
  compare_at_price: Joi.number()
    .positive()
    .greater(Joi.ref("price"))
    .optional()
    .messages({
      "number.greater":
        "Compare-at price must be higher than the selling price",
    }),
  cost_price: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).default(0),
  low_stock_threshold: Joi.number().integer().min(0).default(5),
  specifications: Joi.array().items(spec).max(20).default([]),
  status: Joi.string().valid("active", "inactive", "draft").default("active"),
  is_featured: Joi.boolean().default(false),
  is_new_arrival: Joi.boolean().default(false),
  is_sale: Joi.boolean().default(false),
  meta_title: Joi.string().trim().max(160).optional(),
  meta_description: Joi.string().trim().max(300).optional(),
});

// PATCH allows partial updates so all fields are optional
const updateProduct = createProduct.fork(
  ["name", "slug", "sku", "category_id", "price"],
  (field) => field.optional(),
);

const review = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "any.required": "Rating is required",
  }),
  title: Joi.string().trim().max(150).optional(),
  body: Joi.string().trim().min(10).max(2000).required().messages({
    "string.min": "Review must be at least 10 characters",
    "any.required": "Review body is required",
  }),
});

const listQuery = Joi.object({
  category: Joi.string().optional(),
  search: Joi.string().trim().max(200).optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  in_stock: Joi.boolean().optional(),
  sort: Joi.string()
    .valid(
      "newest",
      "oldest",
      "price-low",
      "price-high",
      "bestseller",
      "rating",
    )
    .default("newest"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
});

module.exports = { createProduct, updateProduct, review, listQuery };