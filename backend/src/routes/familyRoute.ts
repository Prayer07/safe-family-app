// backend/src/routes/family.ts
import { Router } from "express";
import { createFamily, joinFamily, getMyFamily } from "../controllers/familyController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/create", authMiddleware, createFamily);
router.post("/join", authMiddleware, joinFamily);
router.get("/", authMiddleware, getMyFamily);

export default router;