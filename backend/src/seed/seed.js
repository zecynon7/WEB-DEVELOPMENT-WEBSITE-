/**
 * Optional: loads the original Café BLK & BRWN content (copy, menu with prices, branches with hours
 * and locations, gallery) so you do not have to retype it. The site itself starts EMPTY; run this
 * only if you want that content back.
 *
 *   npm run seed          uploads the photos in backend/seed/assets to Cloudinary, then fills the database
 *   npm run seed:local    no Cloudinary: serves the photos from this server (demo/testing only)
 *   add  -- --force       wipes the existing content first (reservations, messages and users are kept)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import { connectDatabase, sql } from "../config/db.js";
import { ENV, assertEnv } from "../config/env.js";
import { generateBranchId, generateCategoryId, generateGalleryId, generateMenuItemId } from "../utils/generateId.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.resolve(__dirname, "../../seed");
const data = JSON.parse(fs.readFileSync(path.join(seedDir, "data.json"), "utf8"));
const local = process.argv.includes("--local");
const force = process.argv.includes("--force");

async function image(rel, folder) {
  if (!rel) return { url: null, public_id: null };
  if (local) return { url: `/seed-assets/${rel}`, public_id: "" };
  const file = path.join(seedDir, "assets", rel);
  const r = await cloudinary.uploader.upload(file, {
    folder: `${ENV.CLOUDINARY_FOLDER}/${folder}`,
    resource_type: "image",
    transformation: [{ width: 2400, crop: "limit" }],
  });
  process.stdout.write(".");
  return { url: r.secure_url, public_id: r.public_id };
}

/** turns { "$img": "path" } placeholders inside page content into uploaded images */
async function resolveImages(value, folder) {
  if (Array.isArray(value)) return Promise.all(value.map((v) => resolveImages(v, folder)));
  if (value && typeof value === "object") {
    if (typeof value.$img === "string") {
      const img = await image(value.$img, folder);
      return { url: img.url, public_id: img.public_id ?? "" };
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await resolveImages(v, folder);
    return out;
  }
  return value;
}

async function main() {
  assertEnv();
  if (!local && !isCloudinaryConfigured) {
    console.error("Cloudinary is not configured. Fill CLOUDINARY_* in backend/.env, or run `npm run seed:local` for a no-Cloudinary demo.");
    process.exit(1);
  }
  await connectDatabase();

  const [{ n }] =
    await sql`SELECT ((SELECT COUNT(*) FROM page_content) + (SELECT COUNT(*) FROM menu_categories) + (SELECT COUNT(*) FROM branches) + (SELECT COUNT(*) FROM gallery_items))::int AS n`;
  if (n > 0 && !force) {
    console.error("The site already has content. Add `-- --force` to replace it.");
    process.exit(1);
  }
  if (force) {
    await sql`DELETE FROM page_content`;
    await sql`DELETE FROM menu_categories`; // items are removed with their categories
    await sql`DELETE FROM branches`;
    await sql`DELETE FROM gallery_items`;
  }

  console.log("Page content…");
  for (const [key, content] of Object.entries(data.pages)) {
    const resolved = await resolveImages(content, key === "site" ? "brand" : "pages");
    await sql`INSERT INTO page_content (page_key, content) VALUES (${key}, ${JSON.stringify(resolved)}::jsonb)`;
  }

  console.log("Menu…");
  let ci = 0;
  for (const cat of data.categories) {
    const category_id = await generateCategoryId();
    await sql`INSERT INTO menu_categories (category_id, slug, label, sort_order) VALUES (${category_id}, ${cat.slug}, ${cat.label}, ${ci++})`;
    let ii = 0;
    for (const it of cat.items) {
      const img = await image(it.image, "menu");
      const item_id = await generateMenuItemId();
      await sql`INSERT INTO menu_items (item_id, category_id, name, price, note, badge, image_url, image_public_id, featured, feature_order, active, sort_order)
        VALUES (${item_id}, ${category_id}, ${it.name}, ${it.price}, ${it.note}, ${it.badge}, ${img.url}, ${img.public_id}, ${it.featured}, ${it.feature_order ?? 0}, TRUE, ${ii++})`;
    }
  }

  console.log("\nBranches…");
  let bi = 0;
  for (const b of data.branches) {
    const img = await image(b.image, "branches");
    const branch_id = await generateBranchId();
    await sql`INSERT INTO branches (branch_id, name, short_name, area, region, description, badge, glance, image_url, image_public_id, hours, note, facebook_url, directions_url, latitude, longitude, active, sort_order)
      VALUES (${branch_id}, ${b.name}, ${b.short_name}, ${b.area}, ${b.region}, ${b.description}, ${b.badge}, ${b.glance}, ${img.url}, ${img.public_id}, ${JSON.stringify(b.hours)}::jsonb,
        ${b.note}, ${b.facebook_url}, ${b.directions_url}, ${b.latitude}, ${b.longitude}, TRUE, ${bi++})`;
  }

  console.log("\nGallery…");
  let gi = 0;
  for (const g of data.gallery) {
    const img = await image(g.image, "gallery");
    const item_id = await generateGalleryId();
    await sql`INSERT INTO gallery_items (item_id, category, caption, alt, image_url, image_public_id, featured, sort_order)
      VALUES (${item_id}, ${g.category}, ${g.caption}, ${g.alt}, ${img.url}, ${img.public_id}, ${g.featured}, ${gi++})`;
  }

  console.log("\nDone. The site now has the original content.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
