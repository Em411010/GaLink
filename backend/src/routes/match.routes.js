import { Router } from "express";
import { getMatchesBySkills } from "../controllers/match.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireBadge } from "../middleware/badge.middleware.js";
const router = Router();
router.get("/", protect, requireBadge(1), getMatchesBySkills);
export default router;
