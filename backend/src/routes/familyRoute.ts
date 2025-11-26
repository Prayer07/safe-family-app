import { Router } from "express";
import { createFamily, joinFamily, getMyFamily, leaveFamily } from "../controllers/familyController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/create", authMiddleware, createFamily);
router.post("/join", authMiddleware, joinFamily);
router.get("/", authMiddleware, getMyFamily);
router.post("/leave", authMiddleware, leaveFamily);

export default router;