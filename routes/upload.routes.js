const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { verifyToken } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) =>
    cb(null, `${uuidv4().replace(/-/g, "")}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only image files are allowed"));
  },
});

router.post("/", verifyToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ detail: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;