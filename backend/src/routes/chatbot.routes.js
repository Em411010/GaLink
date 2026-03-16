import { Router } from "express";
import { interpretUserProblem, chat } from "../controllers/chatbot.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireBadge } from "../middleware/badge.middleware.js";
const router = Router();
router.post("/interpret", protect, requireBadge(1), interpretUserProblem);
router.post("/chat", protect, requireBadge(1), chat);
export default router;
