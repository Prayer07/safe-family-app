import { Router } from "express";
import { register, login, getUser, saveExpoPushToken } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get-user", authMiddleware, getUser);
router.post("/save-token", authMiddleware, saveExpoPushToken);

export default router;