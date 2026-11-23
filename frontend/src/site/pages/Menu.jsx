import { useEffect, useState } from "react";
import { cdn } from "../../lib/format";
import { Icon } from "../components/Icon";
import { PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { Split } from "../components/Split";
import { Tabs } from "../components/Tabs";
import { usePage, useSiteData } from "../SiteContext";
import { SiteLink } from "../Transition";

export default function Menu() {
  const c = usePage("menu");
  const { menu } = useSiteData();
  usePageMeta("Menu");

  // open the category named in the address (/menu#hot)
  const [slug, setSlug] = useState(() => {
    const h = window.location.hash.slice(1);
    return menu.find((m) => m.slug === h)?.slug || menu[0]?.slug || "";
  });
  useEffect(() => {
    if (slug && window.location.hash !== "#" + slug) history.replaceState(null, "", "#" + slug);
  }, [slug]);

  const group = menu.find((m) => m.slug === slug) || menu[0];

  return (
    <>
      <PageIntro c={c} />
      {menu.length > 0 && (
        <div className="container menu-tabs-wrap" data-reveal="rise" style={{ "--d": 500 }}>
          <Tabs label="Menu categories" items={menu.map((m) => ({ key: m.slug, label: m.label }))} active={group?.slug || ""} onChange={setSlug} />
        </div>
      )}
      <div className="menu-groups" style={{ paddingTop: "var(--space-6)" }}>
        {group && (
          <section className="container menu-group show" id={group.slug} key={group.slug} aria-labelledby={`${group.slug}-title`}>
            <div className="section-head">
              <h2 id={`${group.slug}-title`}>{group.label}</h2>
              <p className="price-from">
                {group.items.length} item{group.items.length === 1 ? "" : "s"} · from PHP {Math.min(...group.items.map((i) => i.price))}
              </p>
            </div>
            <ul className="menu-grid" data-stagger="flip" data-cols="5" data-step="70">
              {group.items.map((it) => (
                <li key={it.item_id} data-reveal="flip">
                  <article className="menu-card glass" data-tilt="">
                    <div className="menu-card__photo">
                      {it.image_url && <img src={cdn(it.image_url, 600)} alt={it.name} width={360} height={360} loading="lazy" />}
                      {it.badge && (
                        <span className="badge">
                          <Icon name="star" /> {it.badge}
                        </span>
                      )}
                    </div>
                    <div className="menu-card__body">
                      <h3>{it.name}</h3>
                      {it.note && <p className="menu-card__note">{it.note}</p>}
                      <p className="price">
                        <span className="price__currency">PHP</span>
                        {it.price}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {group && (c.footnote_title || c.footnote_text) && (
        <section className="container menu-footnote" aria-labelledby="menu-cta-title">
          <div className="band" data-reveal="zoom">
            <Split as="h2" id="menu-cta-title" title={c.footnote_title} />
            {c.footnote_text && <p style={{ marginTop: "var(--space-3)" }}>{c.footnote_text}</p>}
            <div className="cluster">
              <SiteLink className="btn btn--primary btn--lg" to="/reserve">
                Save your seat <Icon name="arrow-right" />
              </SiteLink>
              <SiteLink className="btn btn--secondary btn--lg" to="/branches">
                Find a branch
              </SiteLink>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
