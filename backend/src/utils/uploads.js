import fs from "fs";
import { UPLOAD_DIR, BASE_URL } from "../config/config.js";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Public URL of an uploaded file, served by express.static at /uploads
export const getFileURL = (req, file) => {
  const base = BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base.replace(/\/$/, "")}/uploads/${file.filename}`;
};

// Delete an uploaded file, e.g. when the request fails after multer saved it
export const removeUploadedFile = (file) => {
  if (!file?.path) return;
  fs.unlink(file.path, () => {});
};
