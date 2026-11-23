/** Pages whose text and images the admin can edit. "site" holds the shared brand, contact and footer details. */
export const PAGE_KEYS = ["site", "home", "about", "menu", "branches", "gallery", "contact", "reserve", "track", "privacy"];

export const isPageKey = (key) => PAGE_KEYS.includes(key);

export const GALLERY_CATEGORIES = ["moments", "branches", "drinks", "food"];
export const RESERVATION_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
