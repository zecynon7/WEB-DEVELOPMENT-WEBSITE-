import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { ENV } from "./env.js";

/**
 * Database client. Production uses Neon (serverless Postgres over HTTP) exactly like TechCare.
 * For offline development, DATABASE_URL=pglite://./.data runs a real Postgres in-process (no account needed).
 */
async function createClient() {
  if (ENV.DATABASE_URL.startsWith("pglite:")) {
    const { PGlite } = await import("@electric-sql/pglite");
    const dir = ENV.DATABASE_URL.replace(/^pglite:\/*/, "");
    const db = new PGlite(dir === "memory" ? undefined : dir);
    await db.waitReady;
    return async (strings, ...values) => {
      let text = strings[0];
      for (let i = 0; i < values.length; i++) text += `$${i + 1}${strings[i + 1]}`;
      const result = await db.query(text, values);
      return result.rows;
    };
  }
  return neon(ENV.DATABASE_URL);
}

export let sql;

/** Single source of truth for the schema (no migration files, same as TechCare). */
export async function connectDatabase() {
  sql = await createClient();

  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  // One JSON document per page ("site", "home", "about", ...). The admin edits these.
  await sql`CREATE TABLE IF NOT EXISTS page_content (
    page_key TEXT PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    category_id TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    item_id TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL REFERENCES menu_categories(category_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    note TEXT,
    badge TEXT,
    image_url TEXT,
    image_public_id TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    feature_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    branch_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    area TEXT,
    region TEXT,
    description TEXT,
    badge TEXT,
    glance TEXT,
    image_url TEXT,
    image_public_id TEXT,
    hours JSONB NOT NULL DEFAULT '[]'::jsonb,
    note TEXT,
    facebook_url TEXT,
    directions_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS gallery_items (
    id SERIAL PRIMARY KEY,
    item_id TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'moments',
    caption TEXT,
    alt TEXT,
    image_url TEXT NOT NULL,
    image_public_id TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    reservation_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    visit_date TEXT NOT NULL,
    visit_time TEXT NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    duration TEXT,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    inquiry_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  await bootstrapAdmin();
  console.log("Database ready");
}

/** Creates the first admin from ADMIN_USERNAME / ADMIN_PASSWORD when no user exists yet. */
async function bootstrapAdmin() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users`;
  if (count > 0) return;
  if (!ENV.ADMIN_USERNAME || !ENV.ADMIN_PASSWORD) {
    console.warn("No admin account exists. Set ADMIN_USERNAME and ADMIN_PASSWORD in backend/.env and restart to create one.");
    return;
  }
  const { generateUserId } = await import("../utils/generateId.js");
  const user_id = await generateUserId();
  const hash = await bcrypt.hash(ENV.ADMIN_PASSWORD, 10);
  await sql`INSERT INTO users (user_id, username, password, role, full_name, email)
    VALUES (${user_id}, ${ENV.ADMIN_USERNAME.toLowerCase()}, ${hash}, 'admin', ${ENV.ADMIN_FULL_NAME}, ${ENV.ADMIN_EMAIL || null})`;
  console.log(`Admin account "${ENV.ADMIN_USERNAME}" created (${user_id}). You can now remove ADMIN_PASSWORD from .env.`);
}
