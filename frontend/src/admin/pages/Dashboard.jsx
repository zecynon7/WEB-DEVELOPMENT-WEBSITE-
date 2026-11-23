import { Link } from "react-router";
import { ADMIN_PATH } from "../../lib/adminPath";
import { useAuth } from "../auth";
import { useOverview } from "../Shell";
import { Spinner } from "../ui";

export default function Dashboard() {
  const { user } = useAuth();
  const { overview } = useOverview();
  if (!overview) return <Spinner />;
  const c = overview.counts;
  const saved = (k) => overview.pages.some((p) => p.page_key === k);
  const A = (p) => `${ADMIN_PATH}${p}`;

  const steps = [
    {
      done: overview.cloudinary,
      label: "Connect Cloudinary for photo uploads",
      to: "",
      hint: "Add the CLOUDINARY_* values to backend/.env and restart the server.",
    },
    { done: saved("site"), label: "Fill in Site settings", to: "/content/site", hint: "Brand name, logo, phone, email, social links, footer." },
    { done: saved("home"), label: "Write the Home page", to: "/content/home", hint: "Hero headline and photo, story, facts and more." },
    {
      done: c.menu_items > 0,
      label: "Add menu categories and items",
      to: "/menu",
      hint: `${c.menu_items} item${c.menu_items === 1 ? "" : "s"} so far.`,
    },
    {
      done: c.branches > 0,
      label: "Add your branches",
      to: "/branches",
      hint: `${c.branches} branch${c.branches === 1 ? "" : "es"} so far (with hours and map location).`,
    },
    {
      done: c.gallery_items > 0,
      label: "Upload gallery photos",
      to: "/gallery",
      hint: `${c.gallery_items} photo${c.gallery_items === 1 ? "" : "s"} so far.`,
    },
    { done: saved("about"), label: "Write the About page", to: "/content/about", hint: "Story, timeline, values, mission and vision." },
  ];

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>Welcome, {user?.full_name || user?.username}</h1>
          <p className="adm-muted">The website starts empty. Everything you add here appears on it straight away.</p>
        </div>
      </div>

      <div className="adm-stats">
        <Link className="adm-stat" to={A("/reservations")}>
          <b>{c.pending_reservations}</b>
          <span>Pending reservations</span>
        </Link>
        <Link className="adm-stat" to={A("/inquiries")}>
          <b>{c.unread_inquiries}</b>
          <span>Unread messages</span>
        </Link>
        <Link className="adm-stat" to={A("/menu")}>
          <b>{c.menu_items}</b>
          <span>Menu items</span>
        </Link>
        <Link className="adm-stat" to={A("/branches")}>
          <b>{c.branches}</b>
          <span>Branches</span>
        </Link>
        <Link className="adm-stat" to={A("/gallery")}>
          <b>{c.gallery_items}</b>
          <span>Gallery photos</span>
        </Link>
      </div>

      <section className="adm-card">
        <h3>Getting set up</h3>
        <ul className="adm-checklist">
          {steps.map((s) => (
            <li key={s.label} className={s.done ? "is-done" : ""}>
              <span className="adm-checklist__mark">{s.done ? "✓" : ""}</span>
              <div>
                <strong>{s.to ? <Link to={A(s.to)}>{s.label}</Link> : s.label}</strong>
                <p className="adm-muted">{s.hint}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
