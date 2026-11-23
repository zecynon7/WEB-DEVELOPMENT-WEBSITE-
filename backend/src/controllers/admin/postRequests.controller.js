
import { sql } from "../../config/db.js";
import { isCloudinaryConfigured } from "../../config/cloudinary.js";
import { GALLERY_CATEGORIES } from "../../config/pages.js";
import { generateBranchId, generateCategoryId, generateGalleryId, generateMenuItemId, slugify } from "../../utils/generateId.js";
import { cleanImage, uploadImageFile } from "../../utils/images.js";
import { bool, hoursList, num, optStr, safeUrl, str } from "../../utils/validate.js";

const fail = (res, name, err, message) => {
  console.error(`${name}:`, err);
  res.status(500).json({ error: message });
};

// POST /api/admin/upload   multipart: image (file), folder (optional)
export async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "Choose an image to upload." });
    if (!isCloudinaryConfigured) {
      await uploadImageFile(req.file.path).catch(() => {}); // removes the temp file
      return res.status(503).json({ error: "Cloudinary is not set up yet. Add the CLOUDINARY_* values to backend/.env and restart the server." });
    }
    const folder = ["menu", "branches", "gallery", "pages", "brand"].includes(String(req.body?.folder)) ? String(req.body.folder) : "pages";
    const image = await uploadImageFile(req.file.path, folder);
    res.status(201).json({ message: "Image uploaded", image });
  } catch (err) {
    fail(res, "uploadImage", err, "The image could not be uploaded. Please try again.");
  }
}

// POST /api/admin/menu/categories   { label }
export async function addMenuCategory(req, res) {
  try {
    const label = str(req.body?.label, 80);
    if (!label) return res.status(400).json({ error: "Give the category a name." });

    let slug = slugify(label);
    const taken = await sql`SELECT slug FROM menu_categories WHERE slug = ${slug} OR slug LIKE ${slug + "-%"}`;
    if (taken.length) slug = `${slug}-${taken.length + 1}`;

    const [{ next }] = await sql`SELECT COALESCE(MAX(sort_order), -1)::int + 1 AS next FROM menu_categories`;
    const category_id = await generateCategoryId();
    await sql`INSERT INTO menu_categories (category_id, slug, label, sort_order) VALUES (${category_id}, ${slug}, ${label}, ${next})`;
    res.status(201).json({ message: "Category added", category: { category_id, slug, label, sort_order: next, item_count: 0 } });
  } catch (err) {
    fail(res, "addMenuCategory", err, "Could not add the category.");
  }
}

// POST /api/admin/menu/items
export async function addMenuItem(req, res) {
  try {
    const b = req.body || {};
    const name = str(b.name, 120);
    const category_id = str(b.category_id, 40);
    const price = num(b.price);
    if (!name) return res.status(400).json({ error: "Give the item a name." });
    if (price === null || price < 0) return res.status(400).json({ error: "Enter a valid price." });
    const cat = await sql`SELECT category_id FROM menu_categories WHERE category_id = ${category_id}`;
    if (!cat[0]) return res.status(400).json({ error: "Choose a category." });

    const image = cleanImage(b.image);
    const [{ next }] = await sql`SELECT COALESCE(MAX(sort_order), -1)::int + 1 AS next FROM menu_items WHERE category_id = ${category_id}`;
    const item_id = await generateMenuItemId();
    await sql`INSERT INTO menu_items (item_id, category_id, name, price, note, badge, image_url, image_public_id, featured, feature_order, active, sort_order)
      VALUES (${item_id}, ${category_id}, ${name}, ${price}, ${optStr(b.note, 200)}, ${optStr(b.badge, 40)}, ${image?.url ?? null}, ${image?.public_id ?? null},
              ${bool(b.featured)}, ${Math.max(0, Math.round(num(b.feature_order) ?? 0))}, ${bool(b.active, true)}, ${next})`;
    res.status(201).json({ message: "Menu item added", item_id });
  } catch (err) {
    fail(res, "addMenuItem", err, "Could not add the menu item.");
  }
}

// POST /api/admin/branches
export async function addBranch(req, res) {
  try {
    const b = req.body || {};
    const name = str(b.name, 160);
    if (!name) return res.status(400).json({ error: "Give the branch a name." });
    const image = cleanImage(b.image);
    const [{ next }] = await sql`SELECT COALESCE(MAX(sort_order), -1)::int + 1 AS next FROM branches`;
    const branch_id = await generateBranchId();
    await sql`INSERT INTO branches (branch_id, name, short_name, area, region, description, badge, glance, image_url, image_public_id, hours, note,
        facebook_url, directions_url, latitude, longitude, active, sort_order)
      VALUES (${branch_id}, ${name}, ${optStr(b.short_name, 120)}, ${optStr(b.area, 200)}, ${optStr(b.region, 80)}, ${optStr(b.description, 500)},
        ${optStr(b.badge, 40)}, ${optStr(b.glance, 200)}, ${image?.url ?? null}, ${image?.public_id ?? null}, ${JSON.stringify(hoursList(b.hours))}::jsonb,
        ${optStr(b.note, 400)}, ${safeUrl(b.facebook_url)}, ${safeUrl(b.directions_url)}, ${num(b.latitude)}, ${num(b.longitude)}, ${bool(b.active, true)}, ${next})`;
    res.status(201).json({ message: "Branch added", branch_id });
  } catch (err) {
    fail(res, "addBranch", err, "Could not add the branch.");
  }
}

// POST /api/admin/gallery   (one photo per request; the admin sends several in a row for bulk uploads)
export async function addGalleryItem(req, res) {
  try {
    const b = req.body || {};
    const image = cleanImage(b.image);
    if (!image) return res.status(400).json({ error: "Upload a photo first." });
    const category = GALLERY_CATEGORIES.includes(b.category) ? b.category : "moments";
    const [{ next }] = await sql`SELECT COALESCE(MAX(sort_order), -1)::int + 1 AS next FROM gallery_items`;
    const item_id = await generateGalleryId();
    await sql`INSERT INTO gallery_items (item_id, category, caption, alt, image_url, image_public_id, featured, sort_order)
      VALUES (${item_id}, ${category}, ${optStr(b.caption, 120)}, ${optStr(b.alt, 200)}, ${image.url}, ${image.public_id}, ${bool(b.featured)}, ${next})`;
    res.status(201).json({ message: "Photo added", item_id });
  } catch (err) {
    fail(res, "addGalleryItem", err, "Could not add the photo.");
  }
}

// POST /api/admin/reorder/:resource   { ids: [...] }  -> saves the new order
export async function reorder(req, res) {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.some((i) => typeof i !== "string"))
      return res.status(400).json({ error: "Send the list of ids in the new order." });
    const resource = req.params.resource;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (resource === "categories") await sql`UPDATE menu_categories SET sort_order = ${i} WHERE category_id = ${id}`;
      else if (resource === "items") await sql`UPDATE menu_items SET sort_order = ${i} WHERE item_id = ${id}`;
      else if (resource === "branches") await sql`UPDATE branches SET sort_order = ${i} WHERE branch_id = ${id}`;
      else if (resource === "gallery") await sql`UPDATE gallery_items SET sort_order = ${i} WHERE item_id = ${id}`;
      else return res.status(404).json({ error: "Unknown list." });
    }
    res.json({ message: "Order saved" });
  } catch (err) {
    fail(res, "reorder", err, "Could not save the new order.");
  }
}
