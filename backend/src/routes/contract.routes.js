import { Router } from "express";
import {
  getUserContracts, getMyContracts, getContractById,
  createContract, acceptContract, declineContract, updateContractStatus,
  requestModification, resolveModificationRequest,
} from "../controllers/contract.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", protect, getMyContracts);
router.get("/user/:userId", protect, getUserContracts);
router.get("/:id", protect, getContractById);
router.post("/", protect, createContract);
router.put("/:id/accept", protect, acceptContract);
router.put("/:id/decline", protect, declineContract);
router.put("/:id/status", protect, updateContractStatus);
router.post("/:id/modification-request", protect, requestModification);
router.put("/:id/modification-request/:reqId", protect, resolveModificationRequest);

export default router;
