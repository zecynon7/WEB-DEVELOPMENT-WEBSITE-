import { Router } from "express";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getBranches,
  getGalleryItems,
  getInquiries,
  getMenuCategories,
  getMenuItems,
  getOverview,
  getPages,
  getReservations,
} from "../controllers/admin/getRequests.controller.js";
import { addBranch, addGalleryItem, addMenuCategory, addMenuItem, reorder, uploadImage } from "../controllers/admin/postRequests.controller.js";
import {
  updateBranch,
  updateGalleryItem,
  updateInquiry,
  updateMenuCategory,
  updateMenuItem,
  updatePage,
  updateReservationStatus,
} from "../controllers/admin/updateRequests.controller.js";
import {
  deleteBranch,
  deleteGalleryItem,
  deleteInquiry,
  deleteMenuCategory,
  deleteMenuItem,
  deleteReservation,
} from "../controllers/admin/deleteRequest.controller.js";

const router = Router();

// everything under /api/admin needs a signed-in administrator
router.use(authMiddleware, adminMiddleware);

router.get("/overview", getOverview);

router.get("/pages", getPages);
router.put("/pages/:key", updatePage);

router.post("/upload", upload.single("image"), uploadImage);
router.post("/reorder/:resource", reorder);

router.get("/menu/categories", getMenuCategories);
router.post("/menu/categories", addMenuCategory);
router.put("/menu/categories/:category_id", updateMenuCategory);
router.delete("/menu/categories/:category_id", deleteMenuCategory);
router.get("/menu/items", getMenuItems);
router.post("/menu/items", addMenuItem);
router.put("/menu/items/:item_id", updateMenuItem);
router.delete("/menu/items/:item_id", deleteMenuItem);

router.get("/branches", getBranches);
router.post("/branches", addBranch);
router.put("/branches/:branch_id", updateBranch);
router.delete("/branches/:branch_id", deleteBranch);

router.get("/gallery", getGalleryItems);
router.post("/gallery", addGalleryItem);
router.put("/gallery/:item_id", updateGalleryItem);
router.delete("/gallery/:item_id", deleteGalleryItem);

router.get("/reservations", getReservations);
router.patch("/reservations/:reservation_id", updateReservationStatus);
router.delete("/reservations/:reservation_id", deleteReservation);

router.get("/inquiries", getInquiries);
router.patch("/inquiries/:inquiry_id", updateInquiry);
router.delete("/inquiries/:inquiry_id", deleteInquiry);

export default router;
