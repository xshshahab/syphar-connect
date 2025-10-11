import express from "express";
import {
  getAllJob,
  getJobById,
  getJobByLoggedInUser,
  postJob,
} from "../controllers/job.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/create-job").post(isAuthenticated, postJob);
router.route("/all-job").get(isAuthenticated, getAllJob);
router.route("/fetch-by-id/:id").get(isAuthenticated, getJobById);
router.route("/admin-job").get(isAuthenticated, getJobByLoggedInUser);

export default router;
