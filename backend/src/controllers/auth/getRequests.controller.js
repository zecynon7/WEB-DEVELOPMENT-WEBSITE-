

// GET /api/auth/me  (requires a valid token)
export function me(req, res) {
  res.json({ user: req.user });
}
