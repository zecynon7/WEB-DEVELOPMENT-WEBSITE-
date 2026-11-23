import bcrypt from "bcryptjs";

import { sql } from "../../config/db.js";

// PUT /api/auth/password   { current_password, new_password }
export async function changePassword(req, res) {
  try {
    const current = typeof req.body?.current_password === "string" ? req.body.current_password : "";
    const next = typeof req.body?.new_password === "string" ? req.body.new_password : "";
    if (next.length < 8) return res.status(400).json({ error: "The new password needs at least 8 characters." });

    const rows = await sql`SELECT password FROM users WHERE user_id = ${req.user.user_id}`;
    if (!rows[0] || !(await bcrypt.compare(current, rows[0].password))) {
      return res.status(400).json({ error: "Your current password is not correct." });
    }
    const hash = await bcrypt.hash(next, 10);
    await sql`UPDATE users SET password = ${hash} WHERE user_id = ${req.user.user_id}`;
    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("changePassword:", err);
    res.status(500).json({ error: "Could not update the password." });
  }
}
