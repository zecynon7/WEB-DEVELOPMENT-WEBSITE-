

/** Tiny in-memory limiter: `max` requests per `windowMs` per IP. Good enough for one small server. */
export function rateLimit(max, windowMs, message = "Too many attempts. Please try again later.") {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count++;
    if (entry.count > max) return res.status(429).json({ error: message });
    next();
  };
}
