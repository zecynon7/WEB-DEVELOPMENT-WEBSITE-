
import { sql } from "../../config/db.js";
import { isCloudinaryConfigured } from "../../config/cloudinary.js";

const fail = (res, name, err, message) => {
  console.error(`${name}:`, err);
  res.status(500).json({ error: message });
};

// GET /api/admin/overview  -> counts for the dashboard
export async function getOverview(_req, res) {
  try {
    const [counts] = await sql`SELECT
      (SELECT COUNT(*)::int FROM menu_items) AS menu_items,
      (SELECT COUNT(*)::int FROM menu_categories) AS menu_categories,
      (SELECT COUNT(*)::int FROM branches) AS branches,
      (SELECT COUNT(*)::int FROM gallery_items) AS gallery_items,
      (SELECT COUNT(*)::int FROM reservations WHERE status = 'pending') AS pending_reservations,
      (SELECT COUNT(*)::int FROM reservations) AS reservations,
      (SELECT COUNT(*)::int FROM inquiries WHERE is_read = FALSE) AS unread_inquiries,
      (SELECT COUNT(*)::int FROM inquiries) AS inquiries`;
    const pages = await sql`SELECT page_key, updated_at FROM page_content`;
    res.json({ counts, pages, cloudinary: isCloudinaryConfigured });
  } catch (err) {
    fail(res, "getOverview", err, "Could not load the overview.");
  }
}

// GET /api/admin/pages  -> { content: { site: {...}, home: {...} } }
export async function getPages(_req, res) {
  try {
    const rows = await sql`SELECT page_key, content, updated_at FROM page_content`;
    const content = {};
    rows.forEach((r) => (content[r.page_key] = r.content));
    res.json({ content });
  } catch (err) {
    fail(res, "getPages", err, "Could not load the page content.");
  }
}

// GET /api/admin/menu/categories
export async function getMenuCategories(_req, res) {
  try {
    const categories = await sql`SELECT c.category_id, c.slug, c.label, c.sort_order,
        (SELECT COUNT(*)::int FROM menu_items i WHERE i.category_id = c.category_id) AS item_count
      FROM menu_categories c ORDER BY c.sort_order ASC, c.id ASC`;
    res.json({ categories });
  } catch (err) {
    fail(res, "getMenuCategories", err, "Could not load the categories.");
  }
}

// GET /api/admin/menu/items
export async function getMenuItems(_req, res) {
  try {
    const items = await sql`SELECT i.item_id, i.category_id, c.label AS category_label, i.name, i.price::float8 AS price, i.note, i.badge,
        i.image_url, i.image_public_id, i.featured, i.feature_order, i.active, i.sort_order
      FROM menu_items i JOIN menu_categories c ON c.category_id = i.category_id
      ORDER BY c.sort_order ASC, c.id ASC, i.sort_order ASC, i.id ASC`;
    res.json({ items });
  } catch (err) {
    fail(res, "getMenuItems", err, "Could not load the menu items.");
  }
}

// GET /api/admin/branches
export async function getBranches(_req, res) {
  try {
    const branches = await sql`SELECT branch_id, name, short_name, area, region, description, badge, glance, image_url, image_public_id,
        hours, note, facebook_url, directions_url, latitude, longitude, active, sort_order
      FROM branches ORDER BY sort_order ASC, id ASC`;
    res.json({ branches });
  } catch (err) {
    fail(res, "getBranches", err, "Could not load the branches.");
  }
}

// GET /api/admin/gallery
export async function getGalleryItems(_req, res) {
  try {
    const items = await sql`SELECT item_id, category, caption, alt, image_url, image_public_id, featured, sort_order
      FROM gallery_items ORDER BY sort_order ASC, id ASC`;
    res.json({ items });
  } catch (err) {
    fail(res, "getGalleryItems", err, "Could not load the gallery.");
  }
}

// GET /api/admin/reservations
export async function getReservations(_req, res) {
  try {
    const reservations =
      await sql`SELECT reservation_id, full_name, phone, email, branch_name, visit_date, visit_time, guests, duration, note, status, created_at
      FROM reservations ORDER BY created_at DESC, id DESC LIMIT 500`;
    res.json({ reservations });
  } catch (err) {
    fail(res, "getReservations", err, "Could not load the reservations.");
  }
}

// GET /api/admin/inquiries
export async function getInquiries(_req, res) {
  try {
    const inquiries = await sql`SELECT inquiry_id, full_name, email, topic, message, is_read, created_at
      FROM inquiries ORDER BY created_at DESC, id DESC LIMIT 500`;
    res.json({ inquiries });
  } catch (err) {
    fail(res, "getInquiries", err, "Could not load the inquiries.");
  }
}
