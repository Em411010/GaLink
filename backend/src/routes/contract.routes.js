import { Router } from "express";
import { getUserContracts, createContract, updateContractStatus } from "../controllers/contract.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/user/:userId", protect, getUserContracts);
router.post("/", protect, createContract);
router.put("/:id/status", protect, updateContractStatus);

export default router;
