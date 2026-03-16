import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getNotifications, markAsRead, markOneAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAsRead);
router.put("/:id/read", protect, markOneAsRead);

export default router;
