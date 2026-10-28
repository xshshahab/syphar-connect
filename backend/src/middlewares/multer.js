import multer from "multer";
import crypto from "crypto";
import path from "path";
import { UPLOAD_DIR } from "../config/config.js";

const ALLOWED_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const multerInstance = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES[ext] === file.mimetype) return cb(null, true);
    cb(new Error("Only images (jpg, png, webp, gif) and PDF files are allowed"));
  },
});

// Wrap multer so upload errors come back as JSON instead of a 500 HTML page
const withJsonErrors = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large. Maximum size is 5MB"
        : err.message;
    return res.status(400).json({ message, success: false });
  });
};

export const singleUpload = withJsonErrors(multerInstance.single("file"));

// Profile update: "file" is the resume, "profilePhoto" is the avatar
export const profileUpload = withJsonErrors(
  multerInstance.fields([
    { name: "file", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ])
);
