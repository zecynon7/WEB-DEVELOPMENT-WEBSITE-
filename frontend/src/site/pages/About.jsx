import { imgUrl } from "../../lib/format";
import { useScene } from "../../motion/hooks";
import { Icon } from "../components/Icon";
import { CtaBand, PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { Split } from "../components/Split";
import { usePage } from "../SiteContext";
import { SiteLink } from "../Transition";

export default function About() {
  const c = usePage("about");
  usePageMeta("About Us");
  const { ref: tlRef } = useScene({ kind: "view", range: [0.3, 0.62] });
  const photo = imgUrl(c.photo, 1000);
  const timeline = (c.timeline || []).filter((s) => s?.title || s?.text);
  const values = (c.values || []).filter(Boolean);
  const expect = (c.expect || []).filter((e) => e?.title || e?.text);

  return (
    <>
      <PageIntro c={c} />

      {(c.start_title || c.start_accent || c.start_lead || photo) && (
        <section className="container section" aria-labelledby="start-title">
          <div className="split">
            <div className="stack--lg">
              {c.start_eyebrow && (
                <p className="eyebrow">
                  <Icon name="map-pin" /> {c.start_eyebrow}
                </p>
              )}
              <Split as="h2" id="start-title" title={c.start_title} accent={c.start_accent} />
              {c.start_lead && (
                <p className="lead" data-reveal="rise">
                  {c.start_lead}
                </p>
              )}
              {c.start_notice && (
                <p className="notice" data-reveal="rise">
                  {c.start_notice} {c.start_notice_badge && <span className="soon-badge">{c.start_notice_badge}</span>}
                </p>
              )}
              {c.serve_title && (
                <h3 className="heading-md" data-reveal="rise" style={{ marginTop: "var(--space-5)" }}>
                  {c.serve_title}
                </h3>
              )}
              {c.serve_text && <p data-reveal="rise">{c.serve_text}</p>}
              <div className="cluster" data-reveal="rise">
                <SiteLink className="btn btn--primary" to="/branches">
                  Find a warm corner
                </SiteLink>
                <SiteLink className="btn btn--secondary" to="/menu">
                  See the menu
                </SiteLink>
              </div>
            </div>
            {photo && (
              <figure className="glass photo-frame" data-reveal="slide-r">
                <div className="parallax parallax--tall" data-parallax="0.12">
                  <img src={photo} alt={c.photo_alt || ""} loading="lazy" />
                </div>
              </figure>
            )}
          </div>
        </section>
      )}

      {(c.grow_title || c.grow_accent || timeline.length > 0) && (
        <section className="container section" aria-labelledby="grow-title">
          <div className="split split--flip">
            <div className="stack">
              {c.grow_eyebrow && (
                <p className="eyebrow" data-reveal="rise">
                  {c.grow_eyebrow}
                </p>
              )}
              <Split as="h2" id="grow-title" title={c.grow_title} accent={c.grow_accent} />
              {c.grow_text && <p data-reveal="rise">{c.grow_text}</p>}
            </div>
            {timeline.length > 0 && (
              <div className="glass card">
                <ol className="steps steps--line steps--scrub" ref={tlRef}>
                  {timeline.map((s, i) => (
                    <li className="steps__item" style={{ "--i": i }} key={i}>
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
      )}

      {values.length > 0 && (
        <section className="container section" aria-labelledby="values-title">
          <div className="section-head">
            <div className="stack">
              {c.values_eyebrow && <p className="eyebrow">{c.values_eyebrow}</p>}
              <Split as="h2" id="values-title" title={c.values_title} accent={c.values_accent} />
            </div>
          </div>
          <ul className="grid grid--2" data-stagger="flip">
            {values.map((v, i) => (
              <li key={i} data-reveal="flip">
                <div className="value glass" data-tilt="">
                  <span className="value__num">0{i + 1}</span>
                  <p>{v}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(c.mission || c.vision) && (
        <section className="container section" aria-labelledby="mv-title">
          <h2 className="visually-hidden" id="mv-title">
            Mission and vision
          </h2>
          <div className="grid grid--2">
            {c.mission && (
              <article className="card glass" data-reveal="slide-l" data-tilt="">
                <p className="eyebrow">Mission</p>
                <p className="lead">{c.mission}</p>
              </article>
            )}
            {c.vision && (
              <article className="card glass" data-reveal="slide-r" data-tilt="">
                <p className="eyebrow">Vision</p>
                <p className="lead">{c.vision}</p>
              </article>
            )}
          </div>
        </section>
      )}

      {expect.length > 0 && (
        <section className="container section" aria-labelledby="expect-title">
          <div className="section-head">
            <div className="stack">
              {c.expect_eyebrow && <p className="eyebrow">{c.expect_eyebrow}</p>}
              <Split as="h2" id="expect-title" title={c.expect_title} accent={c.expect_accent} />
            </div>
          </div>
          <ul className="grid grid--3" data-stagger="flip" data-step="130">
            {expect.map((e, i) => (
              <li key={i} data-reveal="flip">
                <article className="card glass" data-tilt="">
                  <span className="icon-badge" data-reveal="pop" style={{ "--d": 300 }}>
                    <Icon name={e.icon || "coffee"} />
                  </span>
                  {e.title && <h3>{e.title}</h3>}
                  {e.text && <p>{e.text}</p>}
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand c={c}>
        <SiteLink className="btn btn--primary btn--lg" to="/reserve">
          Reserve a table <Icon name="arrow-right" />
        </SiteLink>
        <SiteLink className="btn btn--secondary btn--lg" to="/branches">
          View branches
        </SiteLink>
      </CtaBand>
    </>
  );
}
