import { useMemo, useRef, useState } from "react";
import { api, errorMessage } from "../../lib/axios";
import { useScene } from "../../motion/hooks";
import { Icon } from "../components/Icon";
import { PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { usePage, useSiteData } from "../SiteContext";
import { SiteLink } from "../Transition";

const TIMES = Array.from({ length: 12 }, (_, i) => `${i + 10}:00`);

export default function Reserve() {
  const c = usePage("reserve");
  const { branches } = useSiteData();
  usePageMeta("Reserve a Table");
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    branch: branches[0]?.name || "",
    date: "",
    time: "",
    guests: "1",
    duration: "1 hour",
    note: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const success = useRef(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const { ref: stepsRef } = useScene({ kind: "view", range: [0.25, 0.6] });

  const done = [
    f.name.trim() !== "",
    /^\d{10}$/.test(f.phone),
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email),
    f.branch !== "",
    f.guests !== "",
    f.date !== "" && f.date >= today,
    f.time !== "",
  ].filter(Boolean).length;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/public/reservations", {
        full_name: f.name,
        phone: "+63" + f.phone,
        email: f.email,
        branch_name: f.branch,
        visit_date: f.date,
        visit_time: f.time,
        guests: Number(f.guests),
        duration: f.duration,
        note: f.note,
        website: f.website,
      });
      setReference(data.reference);
      setF({
        name: "",
        phone: "",
        email: "",
        branch: branches[0]?.name || "",
        date: "",
        time: "",
        guests: "1",
        duration: "1 hour",
        note: "",
        website: "",
      });
      setTimeout(() => success.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const guidelines = (c.guidelines || []).filter((g) => g?.text);
  const steps = (c.steps || []).filter((s) => s?.title || s?.text);

  return (
    <>
      <PageIntro c={c} />
      <section className="container section--tight">
        <div className="form-layout">
          <div className="stack--lg">
            <div className="flow glass" data-reveal="rise">
              <div className="flow__head">
                <span>Reservation progress</span>
                <span>{done} of 7 ready</span>
              </div>
              <div className="progress" style={{ "--value": `${(done / 7) * 100}%` }}>
                <span className="progress__fill" />
              </div>
            </div>
            <form className="glass form-box" onSubmit={submit} data-reveal="flip">
              <div className="form">
                <fieldset className="fieldset">
                  <legend className="fieldset__title">
                    <span className="icon-badge">
                      <Icon name="user" />
                    </span>{" "}
                    Your details
                  </legend>
                  <div className="fields">
                    <div className="field field--m-full">
                      <label className="field__label" htmlFor="name">
                        Full name
                      </label>
                      <input
                        className="input"
                        type="text"
                        id="name"
                        required
                        autoComplete="name"
                        value={f.name}
                        onChange={(e) => set("name", e.target.value)}
                      />
                    </div>
                    <div className="field field--m-full">
                      <label className="field__label" htmlFor="phone">
                        Mobile number
                      </label>
                      <div className="input-group">
                        <span className="input-group__prefix">PH +63</span>
                        <input
                          className="input"
                          type="tel"
                          id="phone"
                          required
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          placeholder="9XX XXX XXXX"
                          autoComplete="tel-national"
                          value={f.phone}
                          onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        />
                      </div>
                      <span className="field__hint">10 digits, without the leading 0.</span>
                    </div>
                    <div className="field field--full">
                      <label className="field__label" htmlFor="email">
                        Email address
                      </label>
                      <input
                        className="input"
                        type="email"
                        id="email"
                        required
                        autoComplete="email"
                        value={f.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    </div>
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset__title">
                    <span className="icon-badge">
                      <Icon name="calendar" />
                    </span>{" "}
                    Your visit
                  </legend>
                  <div className="fields">
                    <div className="field field--full">
                      <label className="field__label" htmlFor="branch">
                        Preferred branch
                      </label>
                      <select className="select" id="branch" value={f.branch} onChange={(e) => set("branch", e.target.value)}>
                        {branches.map((b) => (
                          <option key={b.branch_id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="date">
                        Visit date
                      </label>
                      <input
                        className="input"
                        type="date"
                        id="date"
                        required
                        min={today}
                        value={f.date}
                        onChange={(e) => set("date", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="time">
                        Preferred time
                      </label>
                      <select className="select" id="time" required value={f.time} onChange={(e) => set("time", e.target.value)}>
                        <option value="">Select a time</option>
                        {TIMES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="guests">
                        Number of guests
                      </label>
                      <select className="select" id="guests" value={f.guests} onChange={(e) => set("guests", e.target.value)}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} guest{n > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="duration">
                        Visit length
                      </label>
                      <select className="select" id="duration" value={f.duration} onChange={(e) => set("duration", e.target.value)}>
                        <option>1 hour</option>
                        <option>1 hour 30 minutes</option>
                        <option>2 hours</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset__title">
                    <span className="icon-badge">
                      <Icon name="edit" />
                    </span>{" "}
                    Anything else?
                  </legend>
                  <div className="field">
                    <label className="field__label" htmlFor="note">
                      Special request <small>(optional)</small>
                    </label>
                    <textarea className="textarea" id="note" value={f.note} onChange={(e) => set("note", e.target.value)} />
                  </div>
                  <input
                    type="text"
                    name="website"
                    value={f.website}
                    onChange={(e) => set("website", e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  />
                </fieldset>
                <div className="form-actions">
                  <button className="btn btn--primary btn--lg" type="submit" disabled={busy || branches.length === 0}>
                    {busy ? "Sending…" : "Request reservation"} <Icon name="arrow-right" />
                  </button>
                  {c.submit_note && <p>{c.submit_note}</p>}
                </div>
                {error && (
                  <p className="form__status bad" role="alert">
                    {error}
                  </p>
                )}
                {reference && (
                  <div className="success is-shown" id="success" role="status" ref={success}>
                    <svg className="check-draw" viewBox="0 0 44 44" aria-hidden="true">
                      <circle cx="22" cy="22" r="19" pathLength={1} />
                      <path d="M13 23l6 6 12-13" pathLength={1} />
                    </svg>
                    <p>
                      {c.success_message || "Thank you! Your reservation request was sent. The branch will confirm it soon."} Your reference:{" "}
                      <strong>{reference}</strong>.{" "}
                      <SiteLink className="text-link" to={`/track?ref=${reference}`}>
                        Check its status
                      </SiteLink>
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
          <aside className="stack--lg">
            {guidelines.length > 0 && (
              <div className="glass card" data-reveal="slide-r" data-tilt="">
                {c.guidelines_title && <h2 className="heading-md">{c.guidelines_title}</h2>}
                <ul className="aside-list">
                  {guidelines.map((g, i) => (
                    <li key={i}>
                      <Icon name={g.icon || "clock"} />
                      <span>{g.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {steps.length > 0 && (
              <div className="glass card" data-reveal="slide-r" style={{ "--d": 150 }}>
                {c.next_title && <h2 className="heading-md">{c.next_title}</h2>}
                <ol className="steps steps--line steps--scrub" ref={stepsRef}>
                  {steps.map((s, i) => (
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
            {(c.call_title || c.call_text) && (
              <div className="notice" data-reveal="rise">
                {c.call_title && <h3>{c.call_title}</h3>}
                {c.call_text && (
                  <p className="small" style={{ margin: "8px 0 14px" }}>
                    {c.call_text}
                  </p>
                )}
                <div className="cluster">
                  <SiteLink className="btn btn--secondary btn--sm" to="/branches">
                    View branch contacts
                  </SiteLink>
                  <SiteLink className="text-link" to="/track">
                    Check reservation status
                  </SiteLink>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
