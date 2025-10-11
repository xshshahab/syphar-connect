import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  getAllCompany,
  getCompanyById,
  registerCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register-company").post(isAuthenticated, registerCompany);
router.route("/companies").get(isAuthenticated, getAllCompany);
router.route("/company/:id").get(isAuthenticated, getCompanyById);
router
  .route("/company/update-company/:id")
  .put(isAuthenticated, singleUpload, updateCompany);
router.route("/company/delete/:id").delete(isAuthenticated, deleteCompany);

export default router;
