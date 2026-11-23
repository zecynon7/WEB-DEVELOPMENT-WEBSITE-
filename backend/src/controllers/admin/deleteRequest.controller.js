
import { sql } from "../../config/db.js";
import { deleteImage } from "../../utils/images.js";

const fail = (res, name, err, message) => {
  console.error(`${name}:`, err);
  res.status(500).json({ error: message });
};

// DELETE /api/admin/menu/categories/:category_id  (also removes its items and their images)
export async function deleteMenuCategory(req, res) {
  try {
    const images = await sql`SELECT image_public_id FROM menu_items WHERE category_id = ${req.params.category_id}`;
    const rows = await sql`DELETE FROM menu_categories WHERE category_id = ${req.params.category_id} RETURNING category_id`;
    if (!rows[0]) return res.status(404).json({ error: "Category not found." });
    for (const i of images) await deleteImage(i.image_public_id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    fail(res, "deleteMenuCategory", err, "Could not delete the category.");
  }
}

// DELETE /api/admin/menu/items/:item_id
export async function deleteMenuItem(req, res) {
  try {
    const rows = await sql`DELETE FROM menu_items WHERE item_id = ${req.params.item_id} RETURNING image_public_id`;
    if (!rows[0]) return res.status(404).json({ error: "Menu item not found." });
    await deleteImage(rows[0].image_public_id);
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    fail(res, "deleteMenuItem", err, "Could not delete the menu item.");
  }
}

// DELETE /api/admin/branches/:branch_id
export async function deleteBranch(req, res) {
  try {
    const rows = await sql`DELETE FROM branches WHERE branch_id = ${req.params.branch_id} RETURNING image_public_id`;
    if (!rows[0]) return res.status(404).json({ error: "Branch not found." });
    await deleteImage(rows[0].image_public_id);
    res.json({ message: "Branch deleted" });
  } catch (err) {
    fail(res, "deleteBranch", err, "Could not delete the branch.");
  }
}

// DELETE /api/admin/gallery/:item_id
export async function deleteGalleryItem(req, res) {
  try {
    const rows = await sql`DELETE FROM gallery_items WHERE item_id = ${req.params.item_id} RETURNING image_public_id`;
    if (!rows[0]) return res.status(404).json({ error: "Photo not found." });
    await deleteImage(rows[0].image_public_id);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    fail(res, "deleteGalleryItem", err, "Could not delete the photo.");
  }
}

// DELETE /api/admin/reservations/:reservation_id
export async function deleteReservation(req, res) {
  try {
    const rows = await sql`DELETE FROM reservations WHERE reservation_id = ${req.params.reservation_id} RETURNING reservation_id`;
    if (!rows[0]) return res.status(404).json({ error: "Reservation not found." });
    res.json({ message: "Reservation deleted" });
  } catch (err) {
    fail(res, "deleteReservation", err, "Could not delete the reservation.");
  }
}

// DELETE /api/admin/inquiries/:inquiry_id
export async function deleteInquiry(req, res) {
  try {
    const rows = await sql`DELETE FROM inquiries WHERE inquiry_id = ${req.params.inquiry_id} RETURNING inquiry_id`;
    if (!rows[0]) return res.status(404).json({ error: "Message not found." });
    res.json({ message: "Message deleted" });
  } catch (err) {
    fail(res, "deleteInquiry", err, "Could not delete the message.");
  }
}
