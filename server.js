/**
 * server.js
 * ─────────────────────────────────────────────────────────
 * Application entry point. Responsibilities:
 *   - Load environment variables
 *   - Connect to MongoDB
 *   - Register global middleware (CORS, JSON parsing)
 *   - Mount all API routes under /api
 *   - Register error handler (must be last)
 *   - Start HTTP server
 *
 * Start:    node server.js
 * Dev mode: nodemon server.js
 */

require('dotenv').config();

const express = require("express");
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database ──────────────────────────────────────────────
connectDB();

// ── CORS ──────────────────────────────────────────
const origins = (process.env.CORS_ORIGINS || "*").split(",").map(o => o.trim());
app.use(cors({
  origin: origins.includes("*") ? "*" : origins,
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ──────────────────────────────────────────
// Uploading product images are served from /uploads/<fileName>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ──────────────────────────────────────────
const apiRoutes = require('./routes/index');
app.use("/api", apiRoutes);

// ── Error 404 ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ detail: `${req.method} ${req.path} - route not found` });
});

// ── Error Handler ──────────────────────────────────────────
app.use(errorHandler); 

// ── Start ──────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});     
