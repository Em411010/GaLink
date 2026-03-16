import { Router } from "express";
import { submitRating, getFreelancerRatings } from "../controllers/rating.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/:freelancerId", protect, submitRating);
router.get("/:freelancerId", getFreelancerRatings);
export default router;
