import { Router } from "express";
import {
  getVerificationStatus,
  sendEmailOtp,
  confirmEmailOtp,
  uploadGovernmentId,
  uploadSelfie,
  uploadClearance,
  addPortfolioItem,
  updatePortfolioItem,
  removePortfolioItem,
} from "../controllers/verification.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { imageUpload, resumeUpload } from "../config/cloudinary.js";

const router = Router();

router.get("/status", protect, getVerificationStatus);
router.post("/email/send-otp", protect, sendEmailOtp);
router.post("/email/verify", protect, confirmEmailOtp);
router.post("/government-id", protect, imageUpload.single("governmentId"), uploadGovernmentId);
router.post("/selfie", protect, imageUpload.single("selfie"), uploadSelfie);
router.post("/clearance", protect, imageUpload.single("clearance"), uploadClearance);
router.post("/portfolio", protect, imageUpload.single("portfolioImage"), addPortfolioItem);
router.patch("/portfolio/:itemId", protect, imageUpload.single("portfolioImage"), updatePortfolioItem);
router.delete("/portfolio/:itemId", protect, removePortfolioItem);

export default router;
