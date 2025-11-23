import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getHistory, getSosHistory } from "../controllers/historyController.js";

const router = Router();

router.get("/", authMiddleware, getHistory);
router.get("/sos", authMiddleware, getSosHistory);

export default router;