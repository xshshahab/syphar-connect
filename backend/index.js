import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./src/utils/db.js";
import userRoute from "./src/routes/user.route.js";
import companyRoute from "./src/routes/company.route.js";
import jobRoute from "./src/routes/job.route.js";
import applicationRoute from "./src/routes/application.route.js";
import { UPLOAD_DIR } from "./src/config/config.js";

dotenv.config({});

const app = express();

// Behind nginx: trust X-Forwarded-* so req.protocol is https in production
app.set("trust proxy", 1);
const PORT = process.env.PORT || 9090;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Only needed when the client is served from a different origin than the API
// (always the case in development). Set CLIENT_URL to that origin.
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Uploaded files (profile photos, logos, resumes)
app.use("/uploads", express.static(UPLOAD_DIR));

// Health check: confirms the API is up and whether the database is connected
app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const db = states[mongoose.connection.readyState] ?? "unknown";
  res.status(db === "connected" ? 200 : 503).json({ api: "ok", db });
});

//  Api's Routes
app.use("/api/auth/user", userRoute);
app.use("/api/v1", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);

// Last resort: any error that was not handled returns JSON instead of hanging
app.use((err, req, res, next) => {
  console.error("ERROR! unhandled: ", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Something went wrong", success: false });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`SERVER is running on http://localhost:${PORT}`);
});
