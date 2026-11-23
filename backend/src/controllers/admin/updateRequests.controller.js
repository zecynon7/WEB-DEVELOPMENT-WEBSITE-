
import { sql } from "../../config/db.js";
import { GALLERY_CATEGORIES, RESERVATION_STATUSES, isPageKey } from "../../config/pages.js";
import { cleanImage, collectImages, deleteImage } from "../../utils/images.js";
import { bool, hoursList, num, optStr, safeUrl, str } from "../../utils/validate.js";

const fail = (res, name, err, message) => {
  console.error(`${name}:`, err);
  res.status(500).json({ error: message });
};

/** Keeps page content plain: objects, arrays, strings, numbers, booleans. Caps depth and text length. */
function sanitizeContent(value, depth = 0) {
  if (depth > 6) return null;
  if (typeof value === "string") return value.slice(0, 6000);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 80).map((v) => sanitizeContent(v, depth + 1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value).slice(0, 120)) {
      out[k.slice(0, 60)] = sanitizeContent(v, depth + 1);
    }
    return out;
  }
  return null;
}

// PUT /api/admin/pages/:key   { content }
export async function updatePage(req, res) {
  try {
    const key = String(req.params.key);
    if (!isPageKey(key)) return res.status(404).json({ error: "Unknown page." });
    if (!req.body || typeof req.body.content !== "object" || Array.isArray(req.body.content)) {
      return res.status(400).json({ error: "Send the page content as an object." });
    }
    const content = sanitizeContent(req.body.content);

    const existing = await sql`SELECT content FROM page_content WHERE page_key = ${key}`;
    await sql`INSERT INTO page_content (page_key, content, updated_at) VALUES (${key}, ${JSON.stringify(content)}::jsonb, NOW())
      ON CONFLICT (page_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`;

    // delete Cloudinary images that are no longer used by this page
    const kept = new Set(collectImages(content).map((i) => i.public_id));
    for (const old of collectImages(existing[0]?.content)) {
      if (old.public_id && !kept.has(old.public_id)) await deleteImage(old.public_id);
    }
    res.json({ message: "Page saved", content });
  } catch (err) {
    fail(res, "updatePage", err, "Could not save the page.");
  }
}

// PUT /api/admin/menu/categories/:category_id   { label }
export async function updateMenuCategory(req, res) {
  try {
    const label = str(req.body?.label, 80);
    if (!label) return res.status(400).json({ error: "Give the category a name." });
    const rows =
      await sql`UPDATE menu_categories SET label = ${label} WHERE category_id = ${req.params.category_id} RETURNING category_id, slug, label, sort_order`;
    if (!rows[0]) return res.status(404).json({ error: "Category not found." });
    res.json({ message: "Category updated", category: rows[0] });
  } catch (err) {
    fail(res, "updateMenuCategory", err, "Could not update the category.");
  }
}

// PUT /api/admin/menu/items/:item_id
export async function updateMenuItem(req, res) {
  try {
    const b = req.body || {};
    const existing = (await sql`SELECT image_public_id FROM menu_items WHERE item_id = ${req.params.item_id}`)[0];
    if (!existing) return res.status(404).json({ error: "Menu item not found." });

    const name = str(b.name, 120);
    const price = num(b.price);
    const category_id = str(b.category_id, 40);
    if (!name) return res.status(400).json({ error: "Give the item a name." });
    if (price === null || price < 0) return res.status(400).json({ error: "Enter a valid price." });
    const cat = await sql`SELECT category_id FROM menu_categories WHERE category_id = ${category_id}`;
    if (!cat[0]) return res.status(400).json({ error: "Choose a category." });

    const image = cleanImage(b.image);
    await sql`UPDATE menu_items SET category_id = ${category_id}, name = ${name}, price = ${price}, note = ${optStr(b.note, 200)},
        badge = ${optStr(b.badge, 40)}, image_url = ${image?.url ?? null}, image_public_id = ${image?.public_id ?? null},
        featured = ${bool(b.featured)}, feature_order = ${Math.max(0, Math.round(num(b.feature_order) ?? 0))}, active = ${bool(b.active, true)}
      WHERE item_id = ${req.params.item_id}`;

    if (existing.image_public_id && existing.image_public_id !== (image?.public_id ?? "")) await deleteImage(existing.image_public_id);
    res.json({ message: "Menu item updated" });
  } catch (err) {
    fail(res, "updateMenuItem", err, "Could not update the menu item.");
  }
}

// PUT /api/admin/branches/:branch_id
export async function updateBranch(req, res) {
  try {
    const b = req.body || {};
    const existing = (await sql`SELECT image_public_id FROM branches WHERE branch_id = ${req.params.branch_id}`)[0];
    if (!existing) return res.status(404).json({ error: "Branch not found." });
    const name = str(b.name, 160);
    if (!name) return res.status(400).json({ error: "Give the branch a name." });

    const image = cleanImage(b.image);
    await sql`UPDATE branches SET name = ${name}, short_name = ${optStr(b.short_name, 120)}, area = ${optStr(b.area, 200)}, region = ${optStr(b.region, 80)},
        description = ${optStr(b.description, 500)}, badge = ${optStr(b.badge, 40)}, glance = ${optStr(b.glance, 200)},
        image_url = ${image?.url ?? null}, image_public_id = ${image?.public_id ?? null}, hours = ${JSON.stringify(hoursList(b.hours))}::jsonb,
        note = ${optStr(b.note, 400)}, facebook_url = ${safeUrl(b.facebook_url)}, directions_url = ${safeUrl(b.directions_url)},
        latitude = ${num(b.latitude)}, longitude = ${num(b.longitude)}, active = ${bool(b.active, true)}
      WHERE branch_id = ${req.params.branch_id}`;

    if (existing.image_public_id && existing.image_public_id !== (image?.public_id ?? "")) await deleteImage(existing.image_public_id);
    res.json({ message: "Branch updated" });
  } catch (err) {
    fail(res, "updateBranch", err, "Could not update the branch.");
  }
}

// PUT /api/admin/gallery/:item_id   (the photo itself is replaced by deleting and adding a new one)
export async function updateGalleryItem(req, res) {
  try {
    const b = req.body || {};
    const category = GALLERY_CATEGORIES.includes(b.category) ? b.category : "moments";
    const rows =
      await sql`UPDATE gallery_items SET category = ${category}, caption = ${optStr(b.caption, 120)}, alt = ${optStr(b.alt, 200)}, featured = ${bool(b.featured)}
      WHERE item_id = ${req.params.item_id} RETURNING item_id`;
    if (!rows[0]) return res.status(404).json({ error: "Photo not found." });
    res.json({ message: "Photo updated" });
  } catch (err) {
    fail(res, "updateGalleryItem", err, "Could not update the photo.");
  }
}

// PATCH /api/admin/reservations/:reservation_id   { status }
export async function updateReservationStatus(req, res) {
  try {
    const status = str(req.body?.status, 20);
    if (!RESERVATION_STATUSES.includes(status)) return res.status(400).json({ error: "Unknown status." });
    const rows = await sql`UPDATE reservations SET status = ${status} WHERE reservation_id = ${req.params.reservation_id} RETURNING reservation_id`;
    if (!rows[0]) return res.status(404).json({ error: "Reservation not found." });
    res.json({ message: "Status updated" });
  } catch (err) {
    fail(res, "updateReservationStatus", err, "Could not update the reservation.");
  }
}

// PATCH /api/admin/inquiries/:inquiry_id   { is_read }
export async function updateInquiry(req, res) {
  try {
    const rows =
      await sql`UPDATE inquiries SET is_read = ${bool(req.body?.is_read, true)} WHERE inquiry_id = ${req.params.inquiry_id} RETURNING inquiry_id`;
    if (!rows[0]) return res.status(404).json({ error: "Message not found." });
    res.json({ message: "Message updated" });
  } catch (err) {
    fail(res, "updateInquiry", err, "Could not update the message.");
  }
}
