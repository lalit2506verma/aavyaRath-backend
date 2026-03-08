/**
 * validate(schema, source?)
 *
 * Returns an Express middleware that validates req[source] against
 * the given Joi schema. Defaults to validating req.body.
 *
 * On failure → 422 with a list of { field, message } objects.
 * On success → req[source] is replaced with the sanitized Joi output.
 *
 * Usage in a route file:
 *   router.post('/register', validate(registerSchema), authController.register);
 *   router.get('/products', validate(productQuerySchema, 'query'), productController.list);
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // collect all errors, not just the first
      stripUnknown: true, // drop fields not in the schema
      convert: true, // coerce "1" → 1, "true" → true, etc.
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message.replace(/['"]/g, ""),
      }));
      return res.status(422).json({ detail: "Validation failed", errors });
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;