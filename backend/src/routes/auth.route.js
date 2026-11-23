import { Router } from "express";
import { login } from "../controllers/auth/postRequests.controller.js";
import { me } from "../controllers/auth/getRequests.controller.js";
import { changePassword } from "../controllers/auth/updateRequests.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/login", rateLimit(10, 15 * 60 * 1000, "Too many sign-in attempts. Try again in 15 minutes."), login);
router.get("/me", authMiddleware, me);
router.put("/password", authMiddleware, changePassword);

export default router;
