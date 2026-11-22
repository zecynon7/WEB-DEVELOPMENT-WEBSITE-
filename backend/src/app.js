import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./config/env.js";
import adminRouter from "./routes/admin.route.js";
import authRouter from "./routes/auth.route.js";
import publicRouter from "./routes/public.route.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// server.js starts listening right away and connects to the database afterwards. That way the host
// (Render) sees an open port quickly, and /api/health tells the website the truth: 503 until the
// database is connected, 200 once everything works. The website's loading screen follows this.
let ready = false;
export function setReady(value) {
  ready = value;
}

app.set("trust proxy", 1); // correct client IPs behind Render / Railway / Nginx (rate limits)
app.use(cors(ENV.CLIENT_ORIGINS.length ? { origin: ENV.CLIENT_ORIGINS } : undefined));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.status(ready ? 200 : 503).json({ ok: ready }));

// until the database is connected, every other API call gets a polite "try again"
app.use("/api", (_req, res, next) => (ready ? next() : res.status(503).json({ error: "The server is starting up. Please try again in a moment." })));

// One server, three doors:
app.use("/api/public", publicRouter); // the website (no sign-in)
app.use("/api/auth", authRouter); //     sign-in
app.use("/api/admin", adminRouter); //   the editor (administrators only)

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

// Demo images created by `npm run seed:local` (kept out of the way unless the folder exists)
const seedAssets = path.resolve(__dirname, "../seed/assets");
if (fs.existsSync(seedAssets)) app.use("/seed-assets", express.static(seedAssets, { maxAge: "7d" }));

// anything else (this server only serves the API; the website is hosted separately)
app.get("/", (_req, res) => res.json({ name: "Cafe BLK & BRWN API", health: "/api/health" }));

// upload and parsing errors become plain messages instead of stack traces
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "That image is larger than 10 MB." : err.message;
    return res.status(400).json({ error: message });
  }
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid request." });
  if (err.message?.startsWith("Only JPG")) return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

export default app;
