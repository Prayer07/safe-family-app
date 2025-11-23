// backend/src/routes/sos.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { resolveSos, triggerSos } from "../controllers/sosController.js";

const router = Router();

router.post("/trigger", authMiddleware, triggerSos);
router.post("/resolve/:sosId", authMiddleware, resolveSos); // ✅ Add this

export default router;