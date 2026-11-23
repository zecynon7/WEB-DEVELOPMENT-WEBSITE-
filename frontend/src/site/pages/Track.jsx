import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api, errorMessage } from "../../lib/axios";
import { Icon } from "../components/Icon";
import { PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { usePage, useSite } from "../SiteContext";
import { telHref } from "../../lib/format";
import { SiteLink } from "../Transition";

const fmtShort = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtLong = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

export default function Track() {
  const c = usePage("track");
  const { site } = useSite();
  usePageMeta("Reservation status");
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") || "");
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const lookup = async (code) => {
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    setRes(null);
    try {
      const { data } = await api.get(`/public/reservations/${encodeURIComponent(code.trim())}`);
      setRes(data.reservation);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (params.get("ref")) lookup(params.get("ref")); /* eslint-disable-next-line */
  }, []);
  const submit = (e) => {
    e.preventDefault();
    lookup(ref);
  };

  // which step is "current" for each status
  const stage = res ? ({ pending: 1, confirmed: 2, completed: 3, cancelled: 0 }[res.status] ?? 1) : 0;
  const steps = [
    { t: "Request received", d: res ? fmtShort(res.created_at) : "" },
    { t: "Under review", d: res && stage >= 1 ? fmtShort(res.created_at) : "" },
    { t: "Confirmed", d: "" },
    { t: "Visit day", d: res ? fmtShort(res.date + "T12:00:00") : "" },
  ];

  const pct = res ? (res.status === "cancelled" ? 0 : ([33, 66, 100][Math.min(stage, 2)] ?? 100)) : 0;
  const pillText = res
    ? { pending: "Pending", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" }[res.status] || res.status
    : "";

  return (
    <>
      <PageIntro c={c} />
      <section className="container section--tight">
        <div className="split split--flip" style={{ alignItems: "start" }}>
          <div className="stack--lg">
            <form className="glass card" onSubmit={submit} data-reveal="flip">
              <label className="field__label" htmlFor="ref">
                Your reservation reference
              </label>
              <div className="cluster" style={{ flexWrap: "nowrap" }}>
                <input
                  className="input"
                  id="ref"
                  placeholder="BNB-0000-000"
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  autoComplete="off"
                />
                <button className="btn btn--primary" type="submit" disabled={busy}>
                  {busy ? "Looking…" : "Check"}
                </button>
              </div>
              {error && (
                <p className="form__status bad" role="alert">
                  {error}
                </p>
              )}
            </form>

            {res && (
              <div className="glass card" data-tilt="">
                <div className="cluster" style={{ justifyContent: "space-between" }}>
                  <div>
                    <p className="eyebrow">Reference {res.reference}</p>
                    <h2 className="heading-lg" style={{ marginTop: "var(--space-2)" }}>
                      {res.name}
                    </h2>
                  </div>
                  <span className={`pill ${res.status === "confirmed" || res.status === "completed" ? "confirmed" : "pending"}`}>
                    {res.status === "confirmed" && <Icon name="check" />} {pillText}
                  </span>
                </div>
                <div className="flow__head" style={{ marginTop: "var(--space-5)" }}>
                  <span>Reservation progress</span>
                  <span>{res.status === "cancelled" ? "Cancelled" : `Stage ${Math.min(stage + 1, 4)} of 4`}</span>
                </div>
                <div className="track is-in" style={{ "--pct": `${pct}%` }}>
                  <div className="track__bar">
                    <i />
                  </div>
                  <ol className="track__steps">
                    {steps.map((s, i) => {
                      const cls =
                        res.status === "cancelled"
                          ? i === 0
                            ? "is-done"
                            : ""
                          : i < stage + (stage === 3 ? 1 : 0)
                            ? "is-done"
                            : i === stage
                              ? "is-current"
                              : "";
                      return (
                        <li className={`track__step ${cls}`} key={i}>
                          <span className="track__dot" />
                          <strong>{s.t}</strong>
                          <span>{s.d}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <dl className="track__details">
                  <div>
                    <dt>Branch</dt>
                    <dd>{res.branch}</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>{fmtLong(res.date)}</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>
                      {res.time}
                      {res.duration ? ` · ${res.duration}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Guests</dt>
                    <dd>
                      {res.guests} {res.guests === 1 ? "person" : "people"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
          <div className="stack--lg">
            {(c.help_title || c.help_text) && (
              <div className="glass card" data-reveal="slide-r">
                {c.help_eyebrow && <p className="eyebrow">{c.help_eyebrow}</p>}
                {c.help_title && <h2 className="heading-md">{c.help_title}</h2>}
                {c.help_text && <p>{c.help_text}</p>}
                <div className="cluster">
                  {site.phone && (
                    <a className="btn btn--secondary" href={telHref(site.phone)}>
                      <Icon name="phone" /> Call {site.phone}
                    </a>
                  )}
                  {site.email && (
                    <a className="text-link" href={`mailto:${site.email}`}>
                      Email the café
                    </a>
                  )}
                </div>
              </div>
            )}
            <SiteLink className="btn btn--primary btn--lg" to="/reserve" data-reveal="pop">
              Make a new reservation <Icon name="arrow-right" />
            </SiteLink>
          </div>
        </div>
      </section>
    </>
  );
}
