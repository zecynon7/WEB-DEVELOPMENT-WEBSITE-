
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { sql } from "../config/db.js";

/** Bearer JWT -> loads the user row -> req.user */
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Please sign in." });

  try {
    const decoded = jwt.verify(header.slice(7), ENV.JWT_SECRET);
    const rows = await sql`SELECT user_id, username, role, full_name, email FROM users WHERE user_id = ${decoded.user_id}`;
    if (!rows[0]) return res.status(401).json({ error: "This account no longer exists." });
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}
