import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { pushLocation, getFamilyLastLocations } from "../controllers/locationController.js";

const router = Router();

router.post("/", authMiddleware, pushLocation);
router.get("/family/last", authMiddleware, getFamilyLastLocations);

export default router;