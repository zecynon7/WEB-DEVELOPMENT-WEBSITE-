import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router";
import { ADMIN_PATH } from "../lib/adminPath";
import { api } from "../lib/axios";
import { useAuth } from "./auth";
import { PAGES } from "./contentSchema";
import { Spinner } from "./ui";

const Ctx = createContext({ overview: null, refresh: () => {} });
export const useOverview = () => useContext(Ctx);

const A = (p) => `${ADMIN_PATH}${p}`;

export default function Shell() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const [overview, setOverview] = useState(null);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => {
    api
      .get("/admin/overview")
      .then((r) => setOverview(r.data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);
  useEffect(() => setOpen(false), [pathname]);

  if (loading)
    return (
      <div className="adm-center">
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to={A("/login")} replace />;

  const c = overview?.counts;
  const link = (to, label, badge, end = false) => (
    <NavLink key={to} to={A(to)} end={end} className={({ isActive }) => `adm-nav__link${isActive ? " is-active" : ""}`}>
      <span>{label}</span>
      {badge ? <b className="adm-badge">{badge}</b> : null}
    </NavLink>
  );

  return (
    <Ctx.Provider value={{ overview, refresh }}>
      <div className="adm">
        <header className="adm-top">
          <button className="adm-icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            ☰
          </button>
          <strong>Editor</strong>
        </header>
        <aside className={`adm-side${open ? " is-open" : ""}`}>
          <div className="adm-side__brand">
            <strong>Editor</strong>
            <span>Signed in as {user.full_name || user.username}</span>
          </div>
          <nav className="adm-nav">
            {link("", "Overview", undefined, true)}
            <p className="adm-nav__title">Page texts and photos</p>
            {PAGES.map((p) => link(`/content/${p.key}`, p.label))}
            <p className="adm-nav__title">Collections</p>
            {link("/menu", "Menu items", c?.menu_items)}
            {link("/branches", "Branches", c?.branches)}
            {link("/gallery", "Gallery", c?.gallery_items)}
            <p className="adm-nav__title">Inbox</p>
            {link("/reservations", "Reservations", c?.pending_reservations)}
            {link("/inquiries", "Messages", c?.unread_inquiries)}
            <p className="adm-nav__title">Account</p>
            {link("/account", "Password")}
          </nav>
          <div className="adm-side__foot">
            <a className="btn btn--secondary btn--sm" href="/" target="_blank" rel="noopener noreferrer">
              View website ↗
            </a>
            <button className="btn btn--sm adm-btn-ghost" onClick={logout}>
              Sign out
            </button>
          </div>
        </aside>
        {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}
        <main className="adm-main">
          <Outlet />
        </main>
      </div>
    </Ctx.Provider>
  );
}
