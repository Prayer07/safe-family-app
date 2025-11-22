import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getHistory } from "../controllers/historyController.js";

const router = Router();

router.get("/", authMiddleware, getHistory);

export default router;