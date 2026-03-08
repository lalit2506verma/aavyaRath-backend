const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * verifyToken
 * Reads JWT from Authorization header, verifies it, and attaches
 * the full user document to req.user for use in controllers.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ user_id: decoded.user_id }).lean();

    if (!user) return res.status(401).json({ detail: "User not found" });
    if (!user.is_active)
      return res.status(401).json({ detail: "Account is suspended" });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ detail: "Session expired. Please log in again." });
    }
    return res.status(401).json({ detail: "Invalid token" });
  }
};

/**
 * verifyTokenOptional
 * Same as verifyToken but doesn't block the request if no token is present.
 * req.user will be null for guests.
 */
const verifyTokenOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ user_id: decoded.user_id }).lean();
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * requireAdmin
 * Must be placed AFTER verifyToken in the middleware chain.
 * Blocks anyone who isn't admin or superadmin.
 */
const requireAdmin = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.user?.role)) {
    return res.status(403).json({ detail: "Admin access required" });
  }
  next();
};

module.exports = { verifyToken, verifyTokenOptional, requireAdmin };