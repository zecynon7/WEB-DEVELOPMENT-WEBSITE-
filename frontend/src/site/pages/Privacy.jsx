import { PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { usePage } from "../SiteContext";

export default function Privacy() {
  const c = usePage("privacy");
  usePageMeta("Privacy");
  const sections = (c.sections || []).filter((s) => s?.heading || s?.body);
  return (
    <>
      <PageIntro c={c} />
      {sections.length > 0 && (
        <section className="container section--tight">
          <div className="prose glass card" data-reveal="rise">
            {sections.map((s, i) => (
              <div key={i}>
                {s.heading && <h2>{s.heading}</h2>}
                {s.body && s.body.split(/\n{2,}/).map((p, j) => <p key={j}>{p}</p>)}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
