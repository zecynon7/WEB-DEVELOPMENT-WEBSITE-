import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cdn, imgUrl, safeHref } from "../../lib/format";

import { onResize, reduceMotion } from "../../motion/engine";
import { useScene } from "../../motion/hooks";
import { Counter } from "../components/Counter";
import { Cup } from "../components/Cup";
import { Icon } from "../components/Icon";
import { useLightbox } from "../components/Lightbox";
import { Marquee } from "../components/Marquee";
import { usePageMeta } from "../components/Seo";
import { Split } from "../components/Split";
import { usePage, useSite, useSiteData } from "../SiteContext";
import { SiteLink } from "../Transition";

const css = (v) => v;

/* Words that light up one by one (hero overlay + story paragraph) */
function Words({ text, accent, start = 0 }) {
  let i = start;
  const make = (t) =>
    t
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (
        <Fragment key={i}>
          <span className="sw" style={css({ "--i": i++ })}>
            {w}
          </span>{" "}
        </Fragment>
      ));
  return (
    <>
      {text ? make(text) : null}
      {accent ? <em>{make(accent)}</em> : null}
    </>
  );
}
const wordCount = (...t) => t.join(" ").split(/\s+/).filter(Boolean).length;

/* ------------------------------------------------------------------ HERO */
function Hero({ c }) {
  const [gone, setGone] = useState(false);
  const { ref } = useScene({ kind: "pin", onProgress: (p) => setGone((g) => (g === p > 0.42 ? g : p > 0.42)) });
  const hero = imgUrl(c.hero_image, 1600);
  if (!c.hero_title && !c.hero_accent && !hero) return null;
  const stats = (c.stats || []).filter((s) => s?.label || s?.value);
  const bean = (s, l, t, d, b, o, du, dx, dy, r0, r1, dl, col, k) => (
    <span
      key={k}
      className="bean"
      data-depth={d}
      style={css({
        "--s": s + "px",
        left: l,
        top: t,
        "--b": b + "px",
        "--o": o,
        "--t": du + "s",
        "--dx": dx + "px",
        "--dy": dy + "px",
        "--r0": r0 + "deg",
        "--r1": r1 + "deg",
        "--dl": dl + "s",
        "--bc": col,
      })}
    >
      <svg viewBox="0 0 40 60">
        <use href="#i-bean" />
      </svg>
    </span>
  );

  return (
    <section className={`hero-scene${gone ? " copy-gone" : ""}`} id="hero" ref={ref} aria-labelledby="hero-title">
      <div className="hero-stage">
        <div className="beans hero-beans" aria-hidden="true">
          {[
            bean(64, "3%", "22%", 0.9, 0, 1, 9, 26, -34, -25, 30, 0, "#7a4e2d", 0),
            bean(38, "30%", "12%", 0.5, 1, 0.9, 11, -18, 28, 40, -20, -2, "#4a2f1d", 1),
            bean(88, "44%", "70%", 1.4, 5, 0.55, 13, 30, -40, 10, 70, -4, "#b9824f", 2),
            bean(46, "10%", "78%", 0.7, 0, 1, 10, 22, -30, -50, 15, -1, "#261710", 3),
            bean(30, "50%", "28%", 0.4, 2, 0.8, 8, -14, 22, 60, 0, -5, "#e2c3a3", 4),
            bean(58, "36%", "88%", 1.1, 3, 0.7, 12, -24, -26, 0, -45, -3, "#7a4e2d", 5),
            bean(26, "18%", "8%", 0.3, 1, 0.9, 9, 12, 20, 20, 80, -6, "#b9824f", 6),
            bean(70, "92%", "6%", 1.2, 4, 0.6, 14, -30, 30, -10, 40, -2, "#4a2f1d", 7),
          ]}
        </div>
        <div className="hero-copy">
          {c.hero_eyebrow && (
            <p className="eyebrow" data-intro="" style={css({ "--d": 100 })}>
              <Icon name="coffee" /> {c.hero_eyebrow}
            </p>
          )}
          <Split as="h1" className="hero-title" id="hero-title" title={c.hero_title} accent={c.hero_accent} br />
          {c.hero_lead && (
            <p className="lead" data-intro="" style={css({ "--d": 700 })}>
              {c.hero_lead}
            </p>
          )}
          <div className="cluster" data-intro="" style={css({ "--d": 850 })}>
            <SiteLink className="btn btn--primary btn--lg" to="/reserve">
              Reserve a table <Icon name="arrow-right" />
            </SiteLink>
            <SiteLink className="btn btn--secondary btn--lg" to="/menu">
              Explore the menu
            </SiteLink>
          </div>
          {stats.length > 0 && (
            <dl className="hero__stats" data-intro="" style={css({ "--d": 1000 })}>
              {stats.map((s, i) => {
                const n = Number(s.value);
                return (
                  <div key={i}>
                    <dt>{s.label}</dt>
                    <dd>{Number.isFinite(n) && s.value !== "" ? <Counter value={n} suffix={s.suffix || ""} plain={!!s.plain} /> : s.value}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
        {hero && (
          <div className="hero-photo" data-reveal="clip" style={css({ "--d": 200 })}>
            <img src={hero} alt={c.hero_image_alt || ""} width={1024} height={1024} />
          </div>
        )}
        {c.badge_text && (
          <div className="badge-spin hero-badge" data-intro="" style={css({ "--d": 1200 })} aria-hidden="true">
            <svg className="ring" viewBox="0 0 120 120">
              <defs>
                <path id="ringpath" d="M60 60 m-48 0 a48 48 0 1 1 96 0 a48 48 0 1 1 -96 0" />
              </defs>
              <text>
                <textPath href="#ringpath" textLength={296} lengthAdjust="spacing">
                  {c.badge_text}
                </textPath>
              </text>
            </svg>
            <Icon name="coffee" />
          </div>
        )}
        {(c.overlay_text || c.overlay_accent) && (
          <p className="hero-overlay" aria-hidden="true">
            <span className="hero-overlay__text">
              <Words text={c.overlay_text} accent={c.overlay_accent} start={0} />
            </span>
          </p>
        )}
        {c.story_text && (
          <a className="hero-scroll scroll-cue" href="#story" data-intro="" style={css({ "--d": 1400 })}>
            <span className="scroll-cue__mouse" />
            Scroll
          </a>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ MARQUEE TEXT */
function MarqueeText({ words }) {
  if (!words.length) return null;
  return (
    <Marquee className="marquee--text" speed={55} ariaHidden>
      {words.map((w, i) => (
        <span className="marquee__item" key={i}>
          {w}
          <i className="marquee__dot">
            <svg viewBox="0 0 40 60">
              <use href="#i-bean" />
            </svg>
          </i>
        </span>
      ))}
    </Marquee>
  );
}

/* ------------------------------------------------------------ STORY (scrub) */
function Story({ c }) {
  const { ref } = useScene({ kind: "view", range: [0.12, 0.5] });
  if (!c.story_text && !c.story_accent) return null;
  return (
    <section className="container scrub-section" id="story" aria-label="Who we are">
      {c.story_eyebrow && (
        <p className="eyebrow" data-reveal="rise" style={{ marginBottom: "var(--space-5)" }}>
          {c.story_eyebrow}
        </p>
      )}
      <p className="scrub" ref={ref} style={css({ "--n": wordCount(c.story_text, c.story_accent) })}>
        <Words text={c.story_text} accent={c.story_accent} />
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------- FACTS */
function Facts({ items }) {
  if (!items.length) return null;
  return (
    <section className="container section--tight" aria-label="Why visit">
      <ul className="facts" data-stagger="flip" data-step="140">
        {items.map((f, i) => (
          <li key={i} data-reveal="flip">
            <article className="fact glass" data-tilt="">
              <span className="icon-badge">
                <Icon name={f.icon || "coffee"} />
              </span>
              <div>
                {f.title && <h3>{f.title}</h3>}
                {f.text && <p>{f.text}</p>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ DRINKS */
const TINTS = ["rgba(185,130,79,.6)", "rgba(226,195,163,.5)", "rgba(138,160,104,.45)", "rgba(160,76,120,.45)", "rgba(150,150,80,.4)"];

function Drinks({ c, menu }) {
  const items = menu
    .flatMap((cat) => cat.items.filter((i) => i.featured).map((i) => ({ ...i, cat: cat.label })))
    .sort((a, b) => (a.feature_order || 999) - (b.feature_order || 999)) // stable: ties keep menu order
    .slice(0, 8);
  const n = items.length;
  const [active, setActive] = useState(0);
  const range = [0.03, 0.97];
  const { ref, getScene } = useScene(
    {
      kind: "pin",
      range,
      onProgress: (p) =>
        setActive((a) => {
          const k = Math.min(Math.max(n, 1) - 1, Math.floor(p * n * 0.9999));
          return k === a ? a : k;
        }),
    },
    [n]
  );
  if (!n) return null;
  const st = (i) => (i === active ? "is-active" : i < active ? "is-before" : "is-after");
  const jump = (i) => {
    const s = getScene();
    if (!s) return;
    const p = range[0] + ((i + 0.5) / n) * (range[1] - range[0]);
    window.scrollTo({ top: s.start + p * s.len, behavior: "smooth" });
  };
  return (
    <section className="drinks" id="drinks" ref={ref} aria-label="Menu favorites">
      <div className="drinks__stage">
        <div className="container drinks__head">
          <div className="stack">
            {c.drinks_eyebrow && <p className="eyebrow">{c.drinks_eyebrow}</p>}
            <Split as="h2" title={c.drinks_title} accent={c.drinks_accent} />
          </div>
          <SiteLink className="text-link" to="/menu">
            View the full menu <Icon name="arrow-right" />
          </SiteLink>
        </div>
        <div className="container drinks__grid">
          <ol className="drinks__list">
            {items.map((it, i) => (
              <li key={it.item_id}>
                <button type="button" className={st(i)} onClick={() => jump(i)}>
                  <b>0{i + 1}</b>
                  {it.name}
                </button>
              </li>
            ))}
          </ol>
          <div className="drinks__visual">
            <svg className="drinks__ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="49" />
              <circle cx="50" cy="50" r="46" />
            </svg>
            {items.map((it, i) => (
              <span key={it.item_id} className={`drinks__glow ${st(i)}`} style={css({ "--tint": TINTS[i % TINTS.length] })} />
            ))}
            <div className="drinks__imgs">
              {items.map(
                (it, i) => it.image_url && <img key={it.item_id} className={st(i)} src={cdn(it.image_url, 900)} alt={it.name} loading="lazy" />
              )}
            </div>
            {items.map(
              (it, i) =>
                it.badge && (
                  <span key={it.item_id} className={`drinks__tag ${st(i)}`}>
                    <Icon name="star" /> {it.badge}
                  </span>
                )
            )}
          </div>
          <div className="drinks__dots" role="group" aria-label="Choose a drink">
            {items.map((it, i) => (
              <button key={it.item_id} type="button" className={st(i)} aria-label={it.name} onClick={() => jump(i)} />
            ))}
          </div>
          <div className="drinks__info">
            <div className="roll">
              {items.map((it, i) => (
                <span key={it.item_id} className={`drinks__cat ${st(i)}`}>
                  {it.cat}
                </span>
              ))}
            </div>
            <div className="roll">
              {items.map((it, i) => (
                <h3 key={it.item_id} className={`drinks__name ${st(i)}`}>
                  {it.name}
                </h3>
              ))}
            </div>
            <div className="roll">
              {items.map((it, i) => (
                <span key={it.item_id} className={`drinks__price ${st(i)}`}>
                  <small>PHP</small>
                  {it.price}
                </span>
              ))}
            </div>
            <div className="roll">
              {items.map((it, i) => (
                <span key={it.item_id} className={`drinks__note ${st(i)}`}>
                  {it.note || "\u00a0"}
                </span>
              ))}
            </div>
            <SiteLink className="btn btn--secondary btn--sm drinks__cta" to="/menu">
              See it on the menu <Icon name="arrow-right" />
            </SiteLink>
          </div>
        </div>
        <div className="drinks__bar" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ BRANCH RIDE */
function BranchRide({ c, branches }) {
  const track = useRef(null);
  const geo = useRef({ dist: 0, ox: [] });
  const apply = (p) => {
    const t = track.current;
    if (!t) return;
    const x = -p * geo.current.dist;
    t.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    t.querySelectorAll(".hcard").forEach((card, i) => {
      const img = card.querySelector(".hcard__photo img");
      if (!img) return;
      const off = (geo.current.ox[i] ?? 0) + x - window.innerWidth / 2;
      img.style.transform = `translate3d(${(off * -0.09).toFixed(1)}px,0,0)`;
    });
  };
  const { ref, remeasure } = useScene({ kind: "pin", onProgress: apply }, [branches.length]);

  useLayoutEffect(() => {
    if (reduceMotion || !branches.length) return;
    const size = () => {
      const t = track.current,
        s = ref.current;
      if (!t || !s) return;
      t.style.transform = "none";
      geo.current.dist = Math.max(0, t.scrollWidth - window.innerWidth);
      s.style.height = window.innerHeight + geo.current.dist + window.innerHeight * 0.25 + "px";
      geo.current.ox = Array.from(t.querySelectorAll(".hcard")).map((el) => el.offsetLeft + el.offsetWidth / 2);
      remeasure();
    };
    size();
    return onResize(size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.length, c.ride_title]);

  if (!branches.length) return null;
  return (
    <section className="hscroll" id="branches-ride" ref={ref} aria-label="Our branches">
      <div className="hscroll__stage">
        <div className="hscroll__track" ref={track}>
          {(c.ride_title || c.ride_accent) && (
            <div className="hcard hcard--intro">
              {c.ride_eyebrow && <p className="eyebrow">{c.ride_eyebrow}</p>}
              <Split as="h2" title={c.ride_title} accent={c.ride_accent} />
              {c.ride_lead && <p className="lead">{c.ride_lead}</p>}
              <span className="hint-arrow">
                Keep scrolling <Icon name="arrow-right" />
              </span>
            </div>
          )}
          {branches.map((b, i) => (
            <article className="hcard glass" data-tilt="" key={b.branch_id}>
              <div className="hcard__photo">
                {b.image_url && <img src={cdn(b.image_url, 900)} alt={`${b.short_name || b.name} branch`} loading="lazy" />}
                <span className="hcard__no" aria-hidden="true">
                  0{i + 1}
                </span>
              </div>
              <div className="hcard__body">
                {b.region && <span className="hcard__region">{b.region}</span>}
                <h3>{b.short_name || b.name}</h3>
                {(b.glance || b.hours?.[0]) && (
                  <p className="small">
                    <Icon name="clock" /> {b.glance || `${b.hours[0].label} · ${b.hours[0].value}`}
                  </p>
                )}
              </div>
            </article>
          ))}
          <div className="hcard hcard--end glass">
            {c.ride_end_title && <h3>{c.ride_end_title}</h3>}
            {c.ride_end_text && <p>{c.ride_end_text}</p>}
            <SiteLink className="btn btn--primary" to="/branches">
              Open the Branch Finder <Icon name="arrow-right" />
            </SiteLink>
          </div>
        </div>
        <div className="hscroll__bar" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- TANZA SPLIT */
function Tanza({ c }) {
  const photo = imgUrl(c.tanza_image, 1000);
  if (!c.tanza_title && !c.tanza_accent && !photo) return null;
  return (
    <section className="container section" aria-labelledby="story-title">
      <div className="split">
        <div className="stack--lg">
          {c.tanza_eyebrow && (
            <p className="eyebrow" data-reveal="rise">
              {c.tanza_eyebrow}
            </p>
          )}
          <Split as="h2" id="story-title" title={c.tanza_title} accent={c.tanza_accent} />
          {c.tanza_lead && (
            <p className="lead" data-reveal="rise" style={css({ "--d": 200 })}>
              {c.tanza_lead}
            </p>
          )}
          {c.tanza_text && (
            <p data-reveal="rise" style={css({ "--d": 300 })}>
              {c.tanza_text}
            </p>
          )}
          <SiteLink className="text-link" to="/about" data-reveal="rise" style={css({ "--d": 400 })}>
            Read our story <Icon name="arrow-right" />
          </SiteLink>
        </div>
        {photo && (
          <figure className="glass photo-frame" data-reveal="slide-r">
            <div className="parallax parallax--tall" data-parallax="0.12">
              <img src={photo} alt={c.tanza_image_alt || ""} loading="lazy" />
            </div>
          </figure>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- STRIPS */
function Strips({ c, gallery }) {
  const { open, node } = useLightbox();
  const items = gallery.filter((g) => g.featured);
  if (!items.length) return null;
  const rowA = items.filter((_, i) => i % 2 === 0),
    rowB = items.filter((_, i) => i % 2 === 1);
  const row = (list, dir, speed) => (
    <Marquee className="strip" dir={dir} speed={speed}>
      {list.map((g) => (
        <figure className="marquee__item" key={g.item_id}>
          {/* tabIndex -1: the looping copies are hidden from assistive tech, so keyboard users use the gallery link above */}
          <button
            className="marquee__btn"
            type="button"
            tabIndex={-1}
            aria-label={`View photo: ${g.alt || g.caption || "gallery photo"}`}
            onClick={(e) => open({ src: cdn(g.image_url, 1600), alt: g.alt || g.caption, caption: g.caption }, e.currentTarget.querySelector("img"))}
          >
            <img src={cdn(g.image_url, 600)} alt={g.alt || g.caption || ""} loading="lazy" />
          </button>
        </figure>
      ))}
    </Marquee>
  );

  return (
    <section className="strips" aria-label="Gallery">
      <div className="container section-head" style={{ marginBottom: "var(--space-5)" }}>
        <div className="stack">
          {c.strips_eyebrow && (
            <p className="eyebrow" data-reveal="rise">
              {c.strips_eyebrow}
            </p>
          )}
          <Split as="h2" title={c.strips_title} accent={c.strips_accent} />
        </div>
        <SiteLink className="text-link" to="/gallery">
          View the gallery <Icon name="arrow-right" />
        </SiteLink>
      </div>
      {row(rowA, "left", 45)}
      {rowB.length > 0 && row(rowB, "right", 38)}
      {node}
    </section>
  );
}

/* ---------------------------------------------------------------- HOW BAND */
function How({ c }) {
  const steps = (c.how_steps || []).filter((s) => s?.title || s?.text);
  const { ref } = useScene({ kind: "view", range: [0.3, 0.62] });
  if (!c.how_title && !c.how_accent && !steps.length) return null;
  return (
    <section className="container section" aria-labelledby="how-title">
      <div className="band how" data-reveal="zoom">
        <div className="stack">
          {c.how_eyebrow && <p className="eyebrow">{c.how_eyebrow}</p>}
          <Split as="h2" id="how-title" title={c.how_title} accent={c.how_accent} />
          {c.how_lead && <p className="lead">{c.how_lead}</p>}
          <div className="cluster">
            <SiteLink className="btn btn--primary btn--lg" to="/reserve">
              Reserve a table <Icon name="arrow-right" />
            </SiteLink>
            <SiteLink className="text-link" to="/track">
              Check reservation status
            </SiteLink>
          </div>
        </div>
        {steps.length > 0 && (
          <div className="glass">
            <ol className="steps steps--line steps--scrub" ref={ref}>
              {steps.map((s, i) => (
                <li className="steps__item" style={css({ "--i": i })} key={i}>
                  <div>
                    {s.title && <strong>{s.title}</strong>}
                    {s.text && <span>{s.text}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- LOOP */
function Loop({ c }) {
  const { site } = useSite();
  const fb = safeHref(site.facebook_url),
    ig = safeHref(site.instagram_url);
  if (!c.loop_title && !c.loop_accent) return null;
  return (
    <section className="container section" aria-labelledby="loop-title">
      <div className="glass loop cup-host" data-reveal="flip">
        <div className="stack--lg">
          {c.loop_eyebrow && <p className="eyebrow">{c.loop_eyebrow}</p>}
          <h2 id="loop-title">
            {c.loop_title} {c.loop_accent && <span className="accent">{c.loop_accent}</span>}
          </h2>
          {c.loop_text && <p>{c.loop_text}</p>}
          {(fb || ig) && (
            <div className="cluster">
              {fb && (
                <a className="btn btn--primary" href={fb} target="_blank" rel="noopener noreferrer">
                  <Icon name="facebook" /> Facebook
                </a>
              )}
              {ig && (
                <a className="btn btn--secondary" href={ig} target="_blank" rel="noopener noreferrer">
                  <Icon name="instagram" /> Instagram
                </a>
              )}
            </div>
          )}
        </div>
        <div className="loop__cup">
          <Cup k="c" />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- PAGE */
export default function Home() {
  const c = usePage("home");
  const { menu, branches, gallery } = useSiteData();
  usePageMeta();
  useEffect(() => {
    /* the engine picks up new elements by itself */
  }, []);
  return (
    <>
      <Hero c={c} />
      <MarqueeText words={(c.marquee_words || []).filter(Boolean)} />
      <Story c={c} />
      <Facts items={(c.facts || []).filter((f) => f?.title || f?.text)} />
      <Drinks c={c} menu={menu} />
      <BranchRide c={c} branches={branches} />
      <Tanza c={c} />
      <Strips c={c} gallery={gallery} />
      <How c={c} />
      <Loop c={c} />
    </>
  );
}
