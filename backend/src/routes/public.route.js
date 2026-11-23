import { Router } from "express";
import { getBranches, getContent, getGallery, getMenu, getReservationStatus } from "../controllers/public/getRequests.controller.js";
import { createInquiry, createReservation } from "../controllers/public/postRequests.controller.js";
import { rateLimit } from "../middlewares/rateLimit.middleware.js";

/* The public website's API. Same server and database as the admin API, but read-only
   (plus the two forms), with no sign-in. */
const router = Router();

router.get("/content", getContent);
router.get("/menu", getMenu);
router.get("/branches", getBranches);
router.get("/gallery", getGallery);

router.get("/reservations/:reference", rateLimit(30, 10 * 60 * 1000), getReservationStatus);
router.post("/reservations", rateLimit(10, 60 * 60 * 1000, "Too many requests. Please try again later."), createReservation);
router.post("/inquiries", rateLimit(10, 60 * 60 * 1000, "Too many messages. Please try again later."), createInquiry);

export default router;
