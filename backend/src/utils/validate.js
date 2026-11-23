/* Small hand-written validators (no schema library, same spirit as TechCare). */

export function str(value, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function optStr(value, max = 500) {
  const s = str(value, max);
  return s === "" ? null : s;
}

export function bool(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return fallback;
}

export function num(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Only http(s) links are allowed, so a "javascript:" URL can never be saved. */
export function safeUrl(value) {
  const s = str(value, 600);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? s : null;
  } catch {
    return null;
  }
}

/** Branch hours: [{ label, value }] */
export function hoursList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((r) => ({ label: str(r?.label, 80), value: str(r?.value, 160) }))
    .filter((r) => r.label || r.value)
    .slice(0, 12);
}
