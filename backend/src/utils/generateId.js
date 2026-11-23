import { sql } from "../config/db.js";

/* Human-readable IDs, generated app-side like TechCare:  PREFIX-<date scope>-<sequence>.
   The sequence is found by reading the highest existing ID for that prefix. */

const yy = (d) => String(d.getFullYear()).slice(-2);
const mm = (d) => String(d.getMonth() + 1).padStart(2, "0");
const dd = (d) => String(d.getDate()).padStart(2, "0");

function next(prefix, lastId, pad) {
  const last = lastId ? parseInt(lastId.slice(prefix.length), 10) : 0;
  return `${prefix}${String((Number.isNaN(last) ? 0 : last) + 1).padStart(pad, "0")}`;
}

/** U-YY-MMDD-NNNN (daily) */
export async function generateUserId() {
  const d = new Date();
  const prefix = `U-${yy(d)}-${mm(d)}${dd(d)}-`;
  const rows = await sql`SELECT user_id FROM users WHERE user_id LIKE ${prefix + "%"} ORDER BY user_id DESC LIMIT 1`;
  return next(prefix, rows[0]?.user_id, 4);
}

/** MC-YY-MM-NNN (monthly) */
export async function generateCategoryId() {
  const d = new Date();
  const prefix = `MC-${yy(d)}-${mm(d)}-`;
  const rows = await sql`SELECT category_id FROM menu_categories WHERE category_id LIKE ${prefix + "%"} ORDER BY category_id DESC LIMIT 1`;
  return next(prefix, rows[0]?.category_id, 3);
}

/** MI-YY-MM-NNNN (monthly) */
export async function generateMenuItemId() {
  const d = new Date();
  const prefix = `MI-${yy(d)}-${mm(d)}-`;
  const rows = await sql`SELECT item_id FROM menu_items WHERE item_id LIKE ${prefix + "%"} ORDER BY item_id DESC LIMIT 1`;
  return next(prefix, rows[0]?.item_id, 4);
}

/** BR-YY-MM-NNN (monthly) */
export async function generateBranchId() {
  const d = new Date();
  const prefix = `BR-${yy(d)}-${mm(d)}-`;
  const rows = await sql`SELECT branch_id FROM branches WHERE branch_id LIKE ${prefix + "%"} ORDER BY branch_id DESC LIMIT 1`;
  return next(prefix, rows[0]?.branch_id, 3);
}

/** GL-YY-MM-NNNN (monthly) */
export async function generateGalleryId() {
  const d = new Date();
  const prefix = `GL-${yy(d)}-${mm(d)}-`;
  const rows = await sql`SELECT item_id FROM gallery_items WHERE item_id LIKE ${prefix + "%"} ORDER BY item_id DESC LIMIT 1`;
  return next(prefix, rows[0]?.item_id, 4);
}

/** BNB-MMDD-NNN (daily). This is the reference a guest uses on the status page. */
export async function generateReservationId() {
  const d = new Date();
  const prefix = `BNB-${mm(d)}${dd(d)}-`;
  const rows = await sql`SELECT reservation_id FROM reservations WHERE reservation_id LIKE ${prefix + "%"} ORDER BY reservation_id DESC LIMIT 1`;
  return next(prefix, rows[0]?.reservation_id, 3);
}

/** INQ-YY-MMDD-NNN (daily) */
export async function generateInquiryId() {
  const d = new Date();
  const prefix = `INQ-${yy(d)}-${mm(d)}${dd(d)}-`;
  const rows = await sql`SELECT inquiry_id FROM inquiries WHERE inquiry_id LIKE ${prefix + "%"} ORDER BY inquiry_id DESC LIMIT 1`;
  return next(prefix, rows[0]?.inquiry_id, 3);
}

export function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}
