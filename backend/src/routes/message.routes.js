import { Router } from "express";
import { getConversations, getOrCreateConversation, getMessages, sendMessage, markAsRead, deleteMessage } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireBadge } from "../middleware/badge.middleware.js";
import { imageUpload } from "../config/cloudinary.js";

const router = Router();
router.get("/conversations", protect, requireBadge(1), getConversations);
router.post("/conversations", protect, requireBadge(1), getOrCreateConversation);
router.get("/conversations/:convId", protect, requireBadge(1), getMessages);
router.post("/conversations/:convId", protect, requireBadge(1), imageUpload.single("attachment"), sendMessage);
router.put("/conversations/:convId/read", protect, requireBadge(1), markAsRead);
router.delete("/conversations/:convId/messages/:msgId", protect, requireBadge(1), deleteMessage);
export default router;
