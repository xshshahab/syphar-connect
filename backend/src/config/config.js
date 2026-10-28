import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const backendRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

// Where uploaded files are stored. Set UPLOAD_DIR in .env: an absolute path,
// or a path relative to the backend folder (e.g. ../uploads for development).
export const UPLOAD_DIR = path.resolve(
  backendRoot,
  process.env.UPLOAD_DIR || "uploads"
);

// Public URL of the API, used to build links to uploaded files.
// Falls back to the incoming request host when not set.
export const BASE_URL = process.env.BASE_URL;
