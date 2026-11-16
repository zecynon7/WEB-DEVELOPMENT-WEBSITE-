# Café BLK & BRWN: website + editor
live site:https://cafe-blk-and-brwn.onrender.com

A React website whose **every word, photo, menu item, branch and gallery image is edited from a private
editor page**, backed by one Express API (the same API powers the website and the editor). The frontend and the backend are hosted separately.

```
frontend/   React 19 + Vite (JavaScript)   the public website  AND  the editor (lazy-loaded, own bundle)
backend/    Express (JavaScript)           /api/public  (website)   /api/auth   /api/admin (editor)
            Neon Postgres · Cloudinary · JWT
```

The website **starts empty**. Nothing is hard-coded: sections appear as you fill them in.
The look and every animation are exactly the approved design.

---

## 1. Set up (about 10 minutes)

You need: **Node 20+**, a free **Neon** database, a free **Cloudinary** account.

1. **Install**
   ```bash
   npm run install:all
   ```
2. **Backend settings**: copy `backend/.env.example` to `backend/.env` and fill it in:
   | Setting | Where to get it |
   |---|---|
   | `DATABASE_URL` | neon.tech → create a project → copy the connection string |
   | `JWT_SECRET` | any long random text (16+ characters) |
   | `ADMIN_USERNAME`, `ADMIN_PASSWORD` | your editor login (created once, on the first start). `ADMIN_EMAIL` is optional and unused |
   | `CLOUDINARY_CLOUD_NAME`, `_API_KEY`, `_API_SECRET` | cloudinary.com → Dashboard |

   *No Neon account yet?* Use `DATABASE_URL=pglite://./.data` to try everything on your own computer.
3. **Run it**
   ```bash
   npm run dev
   ```
   - Website: http://localhost:5173
   - Editor: http://localhost:5173/admin  (sign in with the username and password from `.env`)

   The tables are created automatically on first start.

## 2. The editor

Open it from the small, quiet **Admin** link at the very bottom of the website (next to Privacy), or go to **`/admin`**.
The path is built in, so there is nothing to configure. Sign in with the username and password from `backend/.env`.

| Editor section | What it controls |
|---|---|
| **Site settings** | Brand name, tagline, logo (also the browser-tab icon and map pin), phone, email, Facebook/Instagram, footer |
| **Home / About / Menu / Branches / Gallery / Contact / Reserve / Status / Privacy** | Every heading, paragraph, list, number and photo on that page |
| **Menu items** | Categories (the menu tabs) and items: photo, price, note, badge, visibility, "show on the home page" and its position |
| **Branches** | Name, photo, area, region, hours (any rows), note, Facebook link, directions link and **map location** (click the map to place the pin) |
| **Gallery** | Upload many photos at once, caption, category, reorder, "show on the home page strips" |
| **Reservations** | Requests from the website: confirm, complete, cancel, delete |
| **Messages** | Contact-form messages: read, reply by email, delete |
| **Password** | Change your password |

Photos are uploaded straight to **Cloudinary** (stored there, served optimised). Replacing or deleting a photo
removes the old one from Cloudinary.

### Start with the original content (optional)
The site starts empty on purpose. If you want the original café content (copy, 81 menu items with prices,
7 branches with hours and locations, 23 gallery photos) loaded as a starting point:

```bash
npm run seed          # uploads backend/seed/assets to Cloudinary, then fills the database
npm run seed:local    # no Cloudinary: serves the photos from the server (demo only)
```
Add `-- --force` to replace existing content. Reservations, messages and users are never touched.
You can delete `backend/seed/` once you no longer need it.

## 3. Put it online (frontend and backend hosted separately)

**Backend (e.g. Render web service, root directory `backend`)**
- Build command: `npm install`   Start command: `npm start`
- Environment: everything from `backend/.env.example`, with `NODE_ENV=production` and
  **`CLIENT_URL` = the address of your website** (e.g. `https://cafe.netlify.app`; several addresses separated by commas).
  Without it the browser blocks the website's calls to the API (CORS).
- Optional health check path on Render: `/api/health`

**Frontend (e.g. Netlify, Vercel, Render Static Site, root directory `frontend`)**
- Build command: `npm install && npm run build`   Publish directory: `dist`
- Environment variable (set it *before* building): **`VITE_API_BASE_URL=https://your-backend.onrender.com/api`**
- Single-page-app rewrite: Netlify and Cloudflare Pages read `public/_redirects`, Vercel reads `vercel.json`.
  On Render Static Sites add a *Rewrite* rule `/*  →  /index.html`.

### Cold starts (Render free tier)
Render's free web services go to sleep when idle and need up to about a minute to wake on the next visit.
The loading screen is tied to that real wake-up instead of a fake timer:

1. The page starts pinging `GET /api/health` the moment the JavaScript loads. The server answers **503** while it boots and
   connects to the database, and **200** only when it can really serve requests.
2. Then the site downloads its content (content, menu, branches, gallery). Each finished request moves the counter forward.
3. Then the fonts and hero photo. When all three are done the counter reaches 100 and the intro opens.

While the server is still asleep the counter creeps slowly but never passes the step it is waiting for, and after a few seconds a
short "waking up the server" note appears. A warm server loads in about two seconds with no note. If the server cannot be reached
within two minutes the screen offers a **Try again** button. Visitors who do not see the intro (another page than home, a returning
visitor, "reduce motion") get a plain status screen that appears only when the server is slow.

Details live in `frontend/src/lib/boot.js`.

## 4. How it is organised

```
backend/src
  server.js                      Express app and routes (API only; /api/health reports readiness)
  config/        env.js db.js (Neon + schema) cloudinary.js pages.js
  middlewares/   auth (JWT) · admin (role) · multer (image upload) · rateLimit
  routes/        public.route.js   auth.route.js   admin.route.js
  controllers/   public|auth|admin / getRequests · postRequests · updateRequests · deleteRequest
  utils/         generateId.js (BR-26-10-001 style ids) · images.js (Cloudinary) · validate.js
  seed/          optional starter content loader

frontend/src
  App.jsx                        routes (the editor is lazy-loaded)
  site/                          the public website
    SiteLayout.jsx SiteContext.jsx Transition.jsx
    components/  Header Footer Split Marquee Counter Cup Preloader ServerStatus Tabs …
    pages/       Home About Menu Branches Gallery Contact Reserve Track Privacy
  lib/           boot.js (wakes the backend + loads the content) · axios.js · format.js · adminPath.js
  motion/        engine.js (scroll scenes, reveals, tilt, parallax) · hooks.js
  admin/         the editor
    contentSchema.js             ← every editable field of every page (the editor forms are built from this)
    Shell.jsx fields.jsx ui.jsx upload.js
    pages/       Dashboard PageEditor MenuAdmin BranchesAdmin GalleryAdmin Reservations Inquiries Account
  styles/        the approved stylesheets (unchanged)
```

**Make something else editable:** add the field to `frontend/src/admin/contentSchema.js`, then read it in the page
component with `usePage("home").your_key`. No backend change needed.

## 5. API at a glance

| | Who | Endpoints |
|---|---|---|
| `/api/public` | everyone | `GET content · menu · branches · gallery` · `POST reservations · inquiries` · `GET reservations/:reference` |
| `/api/auth` | sign-in | `POST login` · `GET me` · `PUT password` |
| `/api/admin` | signed-in administrators only | pages, menu categories/items, branches, gallery, upload, reorder, reservations, inquiries |

## 6. Good to know

- **Security:** passwords are hashed (bcrypt); every `/api/admin` call needs a valid token; sign-in is rate-limited;
  uploads must be images ≤ 10 MB; saved links must be `http(s)`; the website's forms have a hidden bot trap and rate limits.
  Remove `ADMIN_PASSWORD` from `.env` after the first start.
- **Reservation status page:** a guest enters their reference (e.g. `BNB-1012-001`, shown after they reserve).
  Only first name, branch, date, time, guests and status are shown, never phone or email.
- **"Reduce motion"** and no-JavaScript visitors get a calm, fully readable version of every page.
- The old staff demo page was replaced by the real editor (Reservations and Messages).
