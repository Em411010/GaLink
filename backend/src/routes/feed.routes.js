import { Router } from "express";
import { getFeed, getPost, createPost, likePost, commentPost, replyToComment, deletePost } from "../controllers/feed.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireBadge } from "../middleware/badge.middleware.js";
import { imageUpload } from "../config/cloudinary.js";
const router = Router();
router.get("/", protect, getFeed);
router.get("/:id", protect, getPost);
router.post("/", protect, requireBadge(2), (req, res, next) => {
  imageUpload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary upload error:", err);
      return res.status(400).json({ message: err.message || "Image upload failed" });
    }
    next();
  });
}, createPost);
router.post("/:id/like", protect, likePost);
router.post("/:id/comment", protect, requireBadge(1), commentPost);
router.post("/:id/comment/:commentId/reply", protect, requireBadge(1), replyToComment);
router.delete("/:id", protect, deletePost);
export default router;
