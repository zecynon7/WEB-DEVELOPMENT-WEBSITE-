import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
import { sql } from "../../config/db.js";
import { str } from "../../utils/validate.js";

// POST /api/auth/login   { username, password }
export async function login(req, res) {
  try {
    const username = str(req.body?.username, 80).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!username || !password) return res.status(400).json({ error: "Enter your username and password." });

    const rows = await sql`SELECT user_id, username, password, role, full_name, email FROM users WHERE username = ${username}`;
    const user = rows[0];
    // same message for both cases so nobody can probe which usernames exist
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }

    const token = jwt.sign({ user_id: user.user_id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
    const { password: _hash, ...safe } = user;
    res.json({ message: "Signed in", user: safe, token });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ error: "Could not sign in. Please try again." });
  }
}
