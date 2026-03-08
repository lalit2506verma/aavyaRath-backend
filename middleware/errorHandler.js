/**
 * errorHandler.js
 *
 * Central Express error-handling middleware.
 * Must be registered LAST in server.js (after all routes).
 *
 * Catches any error thrown with next(error) or thrown inside
 * async route handlers that are wrapped with asyncHandler.
 *
 * Returns consistent JSON error shapes instead of HTML stack traces.
 */

// Mongoose duplicate key error code
const MONGO_DUPLICATE_KEY = 11000;

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  // Mongoose validation error (schema-level, not Joi)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({ detail: "Validation failed", errors });
  }

  // MongoDB duplicate key (e.g. unique index violation)
  if (err.code === MONGO_DUPLICATE_KEY) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      detail: `A record with this ${field} already exists`,
    });
  }

  // JWT errors (should normally be caught in auth middleware, but just in case)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ detail: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ detail: "Session expired. Please log in again." });
  }

  // Known application errors (thrown with a status property)
  if (err.status) {
    return res.status(err.status).json({ detail: err.message });
  }

  // Unknown / unexpected errors
  res.status(500).json({ detail: "Something went wrong. Please try again." });
};

/**
 * asyncHandler(fn)
 *
 * Wraps an async controller function so any thrown error is
 * automatically passed to next() and handled by errorHandler.
 *
 * Without this, unhandled promise rejections would crash the process.
 *
 * Usage:
 *   router.get('/example', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
