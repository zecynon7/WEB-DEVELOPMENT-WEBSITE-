import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { finePointer, onFrame, onResize, reduceMotion } from "../../motion/engine";
import { imgUrl } from "../../lib/format";
import { useSite } from "../SiteContext";
import { SiteLink } from "../Transition";
import { Icon } from "./Icon";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "Our story" },
  { to: "/menu", label: "Menu" },
  { to: "/branches", label: "Branches" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { site, brand, logo } = useSite();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = useRef(null);
  const pill = useRef(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // hides while you scroll down, returns the moment you scroll up
  useEffect(() => {
    if (reduceMotion) return;
    let lastY = window.scrollY;
    return onFrame((_dt, y) => {
      setScrolled((s) => (s === y > 40 ? s : y > 40));
      if (Math.abs(y - lastY) < 3) return;
      const hide = y > 160 && y > lastY && !openRef.current;
      setHidden((h) => (h === hide ? h : hide));
      document.documentElement.classList.toggle("hdr-hidden", hide);
      lastY = y;
    });
  }, []);
  useEffect(() => {
    setHidden(false);
    document.documentElement.classList.remove("hdr-hidden");
  }, [pathname]);

  // a pill glides between the nav links
  useEffect(() => {
    const n = nav.current,
      p = pill.current;
    if (!n || !p || !finePointer || reduceMotion) return;
    const move = (a, instant = false) => {
      const r = a.getBoundingClientRect(),
        nr = n.getBoundingClientRect();
      if (instant) p.style.transition = "none";
      p.style.setProperty("--nx", r.left - nr.left + "px");
      p.style.setProperty("--nw", r.width + "px");
      p.classList.add("is-on");
      if (instant) {
        void p.offsetWidth;
        p.style.transition = "";
      }
    };
    const rest = (instant = false) => {
      const cur = n.querySelector('a[aria-current="page"]');
      if (cur) move(cur, instant);
      else p.classList.remove("is-on");
    };
    const links = Array.from(n.querySelectorAll("ul a:not(.btn)"));
    const enter = (e) => move(e.currentTarget);
    links.forEach((a) => {
      a.addEventListener("mouseenter", enter);
      a.addEventListener("focus", enter);
    });
    const leave = () => rest();
    n.addEventListener("mouseleave", leave);
    rest(true);
    const off = onResize(() => rest(true));
    document.fonts?.ready.then(() => rest(true));
    return () => {
      links.forEach((a) => {
        a.removeEventListener("mouseenter", enter);
        a.removeEventListener("focus", enter);
      });
      n.removeEventListener("mouseleave", leave);
      off();
    };
  }, [pathname, brand]);

  const cls = ["site-header", scrolled && "is-scrolled", hidden && "is-hidden", open && "is-menu-open"].filter(Boolean).join(" ");
  const logoSrc = imgUrl(logo, 120);

  return (
    <header className={cls}>
      <SiteLink className="brand" to="/" aria-label={brand ? `${brand}, home` : "Home"}>
        {logoSrc && <img src={logoSrc} alt="" width={48} height={48} />}
        {(brand || site.brand_tagline) && (
          <span>
            {brand && <span className="brand__name">{brand}</span>}
            {site.brand_tagline && <span className="brand__tag">{site.brand_tagline}</span>}
          </span>
        )}
      </SiteLink>
      <nav className={`site-nav${open ? " open" : ""}`} id="nav" aria-label="Main navigation" ref={nav}>
        <span className="nav__pill" ref={pill} />
        <ul>
          {NAV.map((n, i) => (
            <li key={n.to} style={{ "--i": i }}>
              <SiteLink to={n.to} aria-current={pathname === n.to ? "page" : undefined}>
                {n.label}
              </SiteLink>
            </li>
          ))}
          <li className="nav-cta" style={{ "--i": NAV.length }}>
            <SiteLink className="btn btn--primary btn--sm" to="/reserve">
              <Icon name="calendar" /> Reserve a table
            </SiteLink>
          </li>
        </ul>
      </nav>
      <SiteLink className="btn btn--primary btn--sm btn--header" to="/reserve">
        <Icon name="calendar" /> Reserve a table
      </SiteLink>
      <button className="nav-toggle" type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="nav" aria-label="Menu">
        <span className="nav-toggle__bars">
          <i />
          <i />
        </span>
      </button>
    </header>
  );
}
