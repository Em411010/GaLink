import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
  getStats,
  getUsers,
  getPendingClearances,
  approveClearance,
  rejectClearance,
  approveKYC,
  rejectKYC,
  approveGovernmentId,
  rejectGovernmentId,
  approveSelfie,
  rejectSelfie,
  getPendingKYC,
  revokeUser,
  banUser,
  unbanUser,
  getPosts,
  getPost,
  deletePost,
  deleteComment,
  getReels,
  getReel,
  deleteReel,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/pending-clearances", getPendingClearances);
router.post("/users/:id/approve-clearance", approveClearance);
router.post("/users/:id/reject-clearance", rejectClearance);
router.post("/users/:id/approve-kyc", approveKYC);
router.post("/users/:id/reject-kyc", rejectKYC);
router.post("/users/:id/approve-government-id", approveGovernmentId);
router.post("/users/:id/reject-government-id", rejectGovernmentId);
router.post("/users/:id/approve-selfie", approveSelfie);
router.post("/users/:id/reject-selfie", rejectSelfie);
router.get("/pending-kyc", getPendingKYC);
router.post("/users/:id/revoke", revokeUser);
router.post("/users/:id/ban", banUser);
router.post("/users/:id/unban", unbanUser);
router.get("/posts", getPosts);
router.get("/posts/:id", getPost);
router.delete("/posts/:id", deletePost);
router.delete("/posts/:id/comments/:commentId", deleteComment);
router.get("/reels", getReels);
router.get("/reels/:id", getReel);
router.delete("/reels/:id", deleteReel);

export default router;
