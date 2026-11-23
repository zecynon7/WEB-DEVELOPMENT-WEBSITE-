import axios from "axios";

/**
 * Where the backend lives.
 *  - Production (frontend and backend hosted separately): set VITE_API_BASE_URL at build time,
 *    e.g. https://cafe-api.onrender.com/api
 *  - Local development: leave it empty; Vite proxies /api to http://localhost:5000
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

/** Origin of the backend (e.g. https://cafe-api.onrender.com), or "" when it is on the same address as the website. */
export const API_ORIGIN = /^https?:\/\//.test(API_BASE) ? new URL(API_BASE).origin : "";

/** One shared axios instance. The admin token (if any) is added to every request. */
export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bb_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** A readable message from any failed request. */
export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    if (msg) return msg;
    if (!err.response) return "Cannot reach the server. Please try again.";
  }
  return fallback;
}

// an expired or invalid admin session signs you out everywhere
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401 && localStorage.getItem("bb_admin_token") && !String(err.config?.url).includes("/auth/login")) {
      localStorage.removeItem("bb_admin_token");
      window.dispatchEvent(new Event("bb:logout"));
    }
    return Promise.reject(err);
  }
);