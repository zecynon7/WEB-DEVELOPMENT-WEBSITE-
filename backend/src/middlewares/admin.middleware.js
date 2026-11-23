

/** Must run after authMiddleware. */
export function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Administrators only." });
  next();
}
