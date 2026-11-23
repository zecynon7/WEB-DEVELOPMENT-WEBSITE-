
import { sql } from "../../config/db.js";

/* Everything the public website reads. No sign-in needed; nothing private is ever returned. */

// GET /api/public/content  -> { content: { site: {...}, home: {...}, about: {...}, ... } }
export async function getContent(_req, res) {
  try {
    const rows = await sql`SELECT page_key, content FROM page_content`;
    const content = {};
    rows.forEach((r) => (content[r.page_key] = r.content));
    res.json({ content });
  } catch (err) {
    console.error("getContent:", err);
    res.status(500).json({ error: "Could not load the site content." });
  }
}

// GET /api/public/menu  -> { categories: [{ category_id, slug, label, items: [...] }] }
export async function getMenu(_req, res) {
  try {
    const categories = await sql`SELECT category_id, slug, label FROM menu_categories ORDER BY sort_order ASC, id ASC`;
    const items = await sql`SELECT item_id, category_id, name, price::float8 AS price, note, badge, image_url, featured, feature_order
      FROM menu_items WHERE active = TRUE ORDER BY sort_order ASC, id ASC`;
    const result = categories.map((c) => ({ ...c, items: items.filter((i) => i.category_id === c.category_id) })).filter((c) => c.items.length > 0);
    res.json({ categories: result });
  } catch (err) {
    console.error("getMenu:", err);
    res.status(500).json({ error: "Could not load the menu." });
  }
}

// GET /api/public/branches
export async function getBranches(_req, res) {
  try {
    const branches = await sql`SELECT branch_id, name, short_name, area, region, description, badge, glance, image_url, hours, note,
      facebook_url, directions_url, latitude, longitude
      FROM branches WHERE active = TRUE ORDER BY sort_order ASC, id ASC`;
    res.json({ branches });
  } catch (err) {
    console.error("getBranches:", err);
    res.status(500).json({ error: "Could not load the branches." });
  }
}

// GET /api/public/gallery
export async function getGallery(_req, res) {
  try {
    const items = await sql`SELECT item_id, category, caption, alt, image_url, featured
      FROM gallery_items ORDER BY sort_order ASC, id ASC`;
    res.json({ items });
  } catch (err) {
    console.error("getGallery:", err);
    res.status(500).json({ error: "Could not load the gallery." });
  }
}

// GET /api/public/reservations/:reference  -> limited booking details (no phone or email)
export async function getReservationStatus(req, res) {
  try {
    const reference = String(req.params.reference || "")
      .trim()
      .toUpperCase()
      .slice(0, 40);
    const rows = await sql`SELECT reservation_id, full_name, branch_name, visit_date, visit_time, guests, duration, status, created_at
      FROM reservations WHERE reservation_id = ${reference}`;
    const r = rows[0];
    if (!r) return res.status(404).json({ error: "We could not find that reference. Please check it and try again." });

    const [first, ...rest] = String(r.full_name).split(" ");
    const name = rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
    res.json({
      reservation: {
        reference: r.reservation_id,
        name,
        branch: r.branch_name,
        date: r.visit_date,
        time: r.visit_time,
        guests: r.guests,
        duration: r.duration,
        status: r.status,
        created_at: r.created_at,
      },
    });
  } catch (err) {
    console.error("getReservationStatus:", err);
    res.status(500).json({ error: "Could not look up that reservation." });
  }
}
