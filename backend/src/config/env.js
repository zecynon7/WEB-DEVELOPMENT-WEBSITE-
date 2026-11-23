import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  // postgres://... (Neon)   or   pglite://./.data   for a local no-account dev database
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "cafe-blk-and-brwn",
  // first admin account, created on boot only when the users table is empty
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  ADMIN_FULL_NAME: process.env.ADMIN_FULL_NAME || "Site Administrator",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  // The website's address(es), because the website is hosted separately from this API.
  // Comma-separated, e.g. https://cafe.netlify.app,https://www.cafe.com  (trailing slashes are ignored)
  CLIENT_ORIGINS: (process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),
};

export function assertEnv() {
  const missing = [];
  if (!ENV.DATABASE_URL) missing.push("DATABASE_URL");
  if (!ENV.JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}. Copy backend/.env.example to backend/.env and fill it in.`);
    process.exit(1);
  }
  if (ENV.NODE_ENV === "production" && !ENV.CLIENT_ORIGINS.length) {
    console.warn("CLIENT_URL is not set: any website can call this API. Set it to your frontend address.");
  }
  if (ENV.JWT_SECRET.length < 16) {
    console.error("JWT_SECRET is too short. Use at least 16 random characters.");
    process.exit(1);
  }
}
