const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png", "pdf", "doc", "docx"];

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (allowed.test(ext) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type ".${ext || "unknown"}". Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}.`
        )
      );
    }
  },
});

/**
 * Runs the single-file upload and turns multer's failures into a 400 with a
 * readable reason. Without this, a rejected file type or an oversized file fell
 * through to the generic error handler and surfaced as an opaque 500.
 */
const uploadSingleFile = (field) => (req, res, next) =>
  upload.single(field)(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: `File is too large. Maximum size is ${MAX_FILE_BYTES / (1024 * 1024)}MB.`,
      });
    }

    return res.status(400).json({ message: err.message || "File upload rejected" });
  });

module.exports = { upload, uploadSingleFile, uploadDir, MAX_FILE_BYTES, ALLOWED_EXTENSIONS };
