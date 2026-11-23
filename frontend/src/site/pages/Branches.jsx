import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { directionsUrl, imgUrl, cdn, safeHref, telHref } from "../../lib/format";

import { Icon } from "../components/Icon";
import { PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { Tabs } from "../components/Tabs";
import { usePage, useSite, useSiteData } from "../SiteContext";
import { SiteLink } from "../Transition";

const esc = (s) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

/** Leaflet map with one pin per branch that has a location. */
function BranchMap({ branches, brand, logo, focusId }) {
  const el = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const located = useMemo(() => branches.filter((b) => b.latitude != null && b.longitude != null), [branches]);

  useEffect(() => {
    if (!el.current || !located.length) return;
    const m = L.map(el.current, { scrollWheelZoom: false });
    map.current = m;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(m);
    markers.current = {};
    located.forEach((b) => {
      const src = logo || (b.image_url ? cdn(b.image_url, 120) : "");
      const html = src
        ? `<img class="map-pin" src="${esc(src)}" alt="" width="44" height="44" />`
        : `<span class="map-pin" style="display:block;width:22px;height:22px;background:#e2c3a3"></span>`;
      const icon = L.divIcon({
        className: "",
        html,
        iconSize: src ? [44, 44] : [22, 22],
        iconAnchor: src ? [22, 22] : [11, 11],
        popupAnchor: [0, -22],
      });
      const dir = esc(directionsUrl(b, brand));
      const marker = L.marker([b.latitude, b.longitude], { icon })
        .addTo(m)
        .bindPopup(
          `<strong>${esc(b.name)}</strong>${b.area ? `<br>${esc(b.area)}` : ""}<br><a href="${dir}" target="_blank" rel="noopener noreferrer">Get directions</a>`
        );
      markers.current[b.branch_id] = marker;
    });
    m.fitBounds(L.latLngBounds(located.map((b) => [b.latitude, b.longitude])), { padding: [40, 40], maxZoom: 14 });
    return () => {
      m.remove();
      map.current = null;
    };
  }, [located, brand, logo]);

  useEffect(() => {
    if (!focusId || !map.current) return;
    const mk = markers.current[focusId.id];
    if (!mk) return;
    map.current.flyTo(mk.getLatLng(), 16, { duration: 1.1 });
    mk.openPopup();
  }, [focusId]);

  // "Show all branches"
  useEffect(() => {
    const h = () =>
      map.current &&
      located.length &&
      map.current.fitBounds(L.latLngBounds(located.map((b) => [b.latitude, b.longitude])), { padding: [40, 40], maxZoom: 14 });
    window.addEventListener("bb:show-all-pins", h);
    return () => window.removeEventListener("bb:show-all-pins", h);
  }, [located]);

  if (!located.length) return null;
  return <div id="map" ref={el} />;
}

export default function Branches() {
  const c = usePage("branches");
  const { branches } = useSiteData();
  const { brand, logo } = useSite();
  const [text, setText] = useState("");
  const [region, setRegion] = useState("All");
  const [focus, setFocus] = useState(null);
  const mapBox = useRef(null);
  usePageMeta("Branches");

  const regions = Array.from(new Set(branches.map((b) => b.region).filter(Boolean)));
  const filtered = branches.filter((b) => {
    const t = `${b.name} ${b.area || ""}`.toLowerCase().includes(text.toLowerCase());
    return t && (region === "All" || b.region === region);
  });
  const hasMap = branches.some((b) => b.latitude != null && b.longitude != null);

  const showOnMap = (id) => {
    mapBox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFocus((f) => ({ id, n: (f?.n || 0) + 1 }));
  };

  return (
    <>
      <PageIntro c={c} />
      {branches.length > 0 && (
        <section className="container section--tight" aria-label="Find a branch">
          <input
            className="input search"
            type="text"
            placeholder="Search by branch name or area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Search branches"
            data-reveal="rise"
            style={{ maxWidth: 520 }}
          />
          {regions.length > 1 && (
            <Tabs
              reveal
              label="Region"
              active={region}
              onChange={setRegion}
              items={[{ key: "All", label: "All" }, ...regions.map((r) => ({ key: r, label: r }))]}
            />
          )}
          <p className="small muted" style={{ marginBottom: "var(--space-3)" }}>
            Showing {filtered.length} of {branches.length} branch{branches.length === 1 ? "" : "es"}
          </p>

          {hasMap && (
            <div className="map-box glass" ref={mapBox} data-reveal="zoom">
              <div className="map-top">
                <p className="map-title">{c.map_title}</p>
                <button className="btn btn--secondary btn--sm" type="button" onClick={() => window.dispatchEvent(new Event("bb:show-all-pins"))}>
                  Show all branches
                </button>
              </div>
              <BranchMap branches={branches} brand={brand} logo={imgUrl(logo, 120)} focusId={focus} />
              <p className="small muted">Tap “Show on map” on any branch card to zoom to that branch.</p>
            </div>
          )}

          <ul className="branch-grid">
            {filtered.map((b) => {
              const fb = safeHref(b.facebook_url);
              return (
                <li key={`${region}|${text}|${b.branch_id}`} data-reveal="flip">
                  <article className="branch-card glass" data-tilt="" aria-labelledby={`b-${b.branch_id}`}>
                    <div className="branch-card__photo">
                      {b.image_url && (
                        <img src={cdn(b.image_url, 900)} alt={`${b.short_name || b.name} branch`} width={900} height={563} loading="lazy" />
                      )}
                      {b.badge && (
                        <span className="badge">
                          <Icon name="star" /> {b.badge}
                        </span>
                      )}
                    </div>
                    <div className="branch-card__body">
                      <div className="stack">
                        <h2 id={`b-${b.branch_id}`} className="heading-md">
                          {b.name}
                        </h2>
                        {b.area && (
                          <p className="branch-card__place">
                            <Icon name="map-pin" /> {b.area}
                          </p>
                        )}
                        {b.description && <p className="branch-card__desc">{b.description}</p>}
                      </div>
                      {(b.hours?.length > 0 || b.note) && (
                        <div className="hours">
                          <p className="hours__title">
                            <Icon name="clock" /> Operating hours
                          </p>
                          {b.hours?.length > 0 && (
                            <dl>
                              {b.hours.map((h, i) => (
                                <div key={i}>
                                  <dt>{h.label}</dt>
                                  <dd>{h.value}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                          {b.note && <p className="hours__note muted">{b.note}</p>}
                        </div>
                      )}
                      <div className="branch-card__actions">
                        <SiteLink className="btn btn--primary btn--sm" to="/reserve">
                          <Icon name="calendar" /> Reserve
                        </SiteLink>
                        <a className="btn btn--secondary btn--sm" href={directionsUrl(b, brand)} target="_blank" rel="noopener noreferrer">
                          <Icon name="map-pin" /> Directions
                        </a>
                        {b.latitude != null && b.longitude != null && (
                          <button className="btn btn--secondary btn--sm" type="button" onClick={() => showOnMap(b.branch_id)}>
                            <Icon name="map-pin" /> Show on map
                          </button>
                        )}
                        {fb && (
                          <a className="text-link" href={fb} target="_blank" rel="noopener noreferrer">
                            <Icon name="facebook" /> Facebook
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 && <p className="notice">No branch matches that search. Try a different name or area.</p>}
        </section>
      )}
      {(c.note_title || c.note_text) && (
        <section className="container section--tight" aria-labelledby="note-title">
          <div className="glass card" data-reveal="flip">
            {c.note_title && (
              <h2 id="note-title" className="heading-md">
                {c.note_title}
              </h2>
            )}
            {c.note_text && <p>{c.note_text}</p>}
            <div className="cluster">
              <SiteLinkPhone />
              <SiteLink className="text-link" to="/contact">
                More ways to reach us
              </SiteLink>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function SiteLinkPhone() {
  const { site } = useSite();
  if (!site.phone) return null;
  return (
    <a className="btn btn--secondary" href={telHref(site.phone)}>
      <Icon name="phone" /> {site.phone}
    </a>
  );
}
