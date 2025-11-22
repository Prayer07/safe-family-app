// backend/src/routes/sos.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { triggerSos } from "../controllers/sosController.js";

const router = Router();

router.post("/trigger", authMiddleware, triggerSos);

export default router;