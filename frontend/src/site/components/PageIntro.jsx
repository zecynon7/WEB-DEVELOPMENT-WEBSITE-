

import { PageBeans } from "./PageBeans";
import { Split } from "./Split";

/** First block of every inner page. Reads <prefix>_eyebrow / _title / _accent / _lead from the page content. */
export function PageIntro({ c, prefix = "intro", children }) {
  const eyebrow = c[`${prefix}_eyebrow`],
    title = c[`${prefix}_title`],
    accent = c[`${prefix}_accent`],
    lead = c[`${prefix}_lead`];
  if (!eyebrow && !title && !accent && !lead) return null;
  return (
    <header className="container page-intro">
      <PageBeans />
      <div className="stack">
        {eyebrow && (
          <p className="eyebrow" data-reveal="rise">
            {eyebrow}
          </p>
        )}
        <Split as="h1" title={title} accent={accent} />
        {lead && (
          <p className="lead" data-reveal="rise" style={{ "--d": 350 }}>
            {lead}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}

/** Closing khaki band. Reads cta_eyebrow / cta_title / cta_accent / cta_text. */
export function CtaBand({ c, children }) {
  if (!c.cta_title && !c.cta_accent) return null;
  return (
    <section className="container section" aria-label="Next step">
      <div className="band" data-reveal="zoom">
        {c.cta_eyebrow && <p className="eyebrow">{c.cta_eyebrow}</p>}
        <Split as="h2" title={c.cta_title} accent={c.cta_accent} style={{ marginTop: "var(--space-3)" }} />
        {c.cta_text && <p style={{ marginTop: "var(--space-4)" }}>{c.cta_text}</p>}
        <div className="cluster" style={{ marginTop: "var(--space-5)" }}>
          {children}
        </div>
      </div>
    </section>
  );
}
