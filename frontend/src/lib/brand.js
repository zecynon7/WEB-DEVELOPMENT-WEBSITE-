/**
 * The logo and name shown on the loading screen.
 * They normally come from the backend, but while the backend is still waking up there is nothing to read yet.
 * So the loading screen uses, in this order:
 *   1. what the backend last told us (remembered in this browser, so edits made in the editor show up here too)
 *   2. the built-in defaults below (the logo file is frontend/public/logo.jpg)
 */
const KEY = "bb_brand";
export const DEFAULT_BRAND = { name: "BLK & BRWN", logo: "/logo.jpg" };

export function readBrand() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v?.name) return { name: v.name, logo: v.logo || DEFAULT_BRAND.logo };
  } catch {
    /* nothing saved yet, or storage is blocked */
  }
  return DEFAULT_BRAND;
}

export function saveBrand(brand) {
  try {
    localStorage.setItem(KEY, JSON.stringify(brand));
  } catch {
    /* private mode */
  }
}