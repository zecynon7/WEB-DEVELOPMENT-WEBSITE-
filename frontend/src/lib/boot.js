import axios from "axios";
import { API_BASE, api } from "./axios";

/**
 * Startup of the website = waking the backend + loading its content.
 *
 * On Render's free tier the backend goes to sleep when nobody uses it, and the first request after that
 * takes anywhere from a few seconds to about a minute. The loading screen follows the REAL steps below
 * instead of a made-up timer:
 *
 *   "waking"   asking GET /api/health until the server answers {ok:true}  (this is the cold start)
 *   "loading"  fetching content, menu, branches, gallery (4 requests, `done` counts them)
 *   "ready"    everything is here
 *   "failed"   the server never answered (gives up after GIVE_UP_MS); retry() starts over
 */
export const TOTAL_REQUESTS = 4;
const GIVE_UP_MS = 90_000; // a Render cold start is normally under a minute; past this it is a real server error
const POLL_EVERY_MS = 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let state = {
  phase: "waking",
  startedAt: Date.now(),
  done: 0,
  data: { content: {}, menu: [], branches: [], gallery: [] },
};
const listeners = new Set();
const set = (patch) => {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
};
export const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getState = () => state;

let wakePromise = null;
let dataPromise = null;

/** Pings the backend until it answers. Safe to call many times; it only runs once until retry(). */
export function wake() {
  if (wakePromise) return wakePromise;
  wakePromise = (async () => {
    const t0 = Date.now();
    while (Date.now() - t0 < GIVE_UP_MS) {
      try {
        const { data } = await axios.get(`${API_BASE}/health`, { timeout: 10_000 });
        // a sleeping Render service can answer with its own HTML "starting" page, so check the body, not just the status
        if (data && data.ok === true) {
          set((s) => (s.phase === "waking" ? { phase: "awake" } : {}));
          return true;
        }
      } catch {
        /* still asleep or the database is still connecting: try again */
      }
      await sleep(POLL_EVERY_MS);
    }
    set({ phase: "failed" });
    return false;
  })();
  return wakePromise;
}

async function getWithRetry(path) {
  try {
    return (await api.get(path, { timeout: 20_000 })).data;
  } catch {
    await sleep(800);
    return (await api.get(path, { timeout: 20_000 })).data;
  }
}

/** Loads everything the public website shows (once). Waits for the backend to be awake first. */
export function loadSiteData() {
  if (dataPromise) return dataPromise;
  dataPromise = (async () => {
    if (!(await wake())) {
      dataPromise = null;
      return;
    }
    set({ phase: "loading", done: 0 });
    const tick = (p) => p.finally(() => set((s) => ({ done: s.done + 1 })));
    const [content, menu, branches, gallery] = await Promise.allSettled([
      tick(getWithRetry("/public/content")),
      tick(getWithRetry("/public/menu")),
      tick(getWithRetry("/public/branches")),
      tick(getWithRetry("/public/gallery")),
    ]);
    // if one request still fails after its retry, that part of the site is simply empty
    set({
      phase: "ready",
      data: {
        content: content.status === "fulfilled" ? content.value.content : {},
        menu: menu.status === "fulfilled" ? menu.value.categories : [],
        branches: branches.status === "fulfilled" ? branches.value.branches : [],
        gallery: gallery.status === "fulfilled" ? gallery.value.items : [],
      },
    });
  })();
  return dataPromise;
}

/** "Try again" after the server could not be reached. */
export function retry() {
  wakePromise = null;
  dataPromise = null;
  set({ phase: "waking", startedAt: Date.now(), done: 0 });
  loadSiteData();
}

/**
 * How far along the startup really is, as a 0..1 number for the progress counter.
 * `real` is what has actually happened; `ceil` is how far the counter may creep while it waits for the next step,
 * so it never looks frozen but also never claims a step that has not happened.
 */
export function bootProgress(b, assetsDone) {
  switch (b.phase) {
    case "waking":
      return { real: 0, ceil: 0.4 };
    case "awake":
      return { real: 0.42, ceil: 0.5 };
    case "loading": {
      const real = 0.42 + 0.4 * (b.done / TOTAL_REQUESTS);
      return { real, ceil: Math.min(0.9, real + 0.07) };
    }
    case "ready":
      return assetsDone ? { real: 1, ceil: 1 } : { real: 0.85, ceil: 0.97 };
    default:
      return { real: 0, ceil: 0 }; // failed
  }
}