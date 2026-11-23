import { useState } from "react";
import { errorMessage, api } from "../../lib/axios";
import { safeHref, telHref } from "../../lib/format";
import { Icon } from "../components/Icon";
import { PageIntro } from "../components/PageIntro";
import { usePageMeta } from "../components/Seo";
import { usePage, useSite } from "../SiteContext";
import { SiteLink } from "../Transition";

export default function Contact() {
  const c = usePage("contact");
  const { site } = useSite();
  usePageMeta("Contact");
  const [f, setF] = useState({ name: "", email: "", topic: "General inquiry", message: "", website: "" });
  const [bad, setBad] = useState({});
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const fb = safeHref(site.facebook_url),
    ig = safeHref(site.instagram_url);
  const rows = [];
  if (site.phone)
    rows.push({
      icon: "phone",
      title: "Call us",
      body: (
        <a className="text-link" href={telHref(site.phone)}>
          {site.phone}
        </a>
      ),
    });
  if (site.email)
    rows.push({
      icon: "mail",
      title: "Email",
      body: (
        <a className="text-link" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      ),
    });
  if (c.home_branch) rows.push({ icon: "map-pin", title: "Home branch", body: c.home_branch });
  if (c.hours_text)
    rows.push({
      icon: "clock",
      title: "Hours",
      body: (
        <>
          {c.hours_text}{" "}
          <SiteLink className="text-link" to="/branches">
            See branch hours
          </SiteLink>
        </>
      ),
    });
  if (fb || ig)
    rows.push({
      icon: "sparkles",
      title: "Follow us",
      body: (
        <>
          {fb && (
            <a className="text-link" href={fb} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          )}
          {fb && ig && " · "}
          {ig && (
            <a className="text-link" href={ig} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
        </>
      ),
    });

  const submit = async (e) => {
    e.preventDefault();
    const nameOk = f.name.trim() !== "",
      emailOk = f.email.includes("@") && f.email.includes("."),
      messageOk = f.message.trim() !== "";
    setBad({ name: !nameOk, email: !emailOk, message: !messageOk });
    if (!(nameOk && emailOk && messageOk)) {
      setStatus({ kind: "bad", text: "Please fill in all required fields with valid information." });
      return;
    }
    setBusy(true);
    try {
      await api.post("/public/inquiries", { full_name: f.name, email: f.email, topic: f.topic, message: f.message, website: f.website });
      setF({ name: "", email: "", topic: "General inquiry", message: "", website: "" });
      setStatus({ kind: "ok", text: c.success_message || "Thank you! Your message has been sent." });
    } catch (err) {
      setStatus({ kind: "bad", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageIntro c={c} />
      <section className="container section--tight">
        <div className="contact-layout">
          <div className="stack--lg">
            {rows.length > 0 && (
              <div className="glass card" data-reveal="slide-l" data-tilt="">
                {c.hello_title && <h2 className="heading-md">{c.hello_title}</h2>}
                <ul className="aside-list">
                  {rows.map((r, i) => (
                    <li key={i}>
                      <Icon name={r.icon} />
                      <div>
                        <strong>{r.title}</strong>
                        <br />
                        {r.body}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(c.branch_card_title || c.branch_card_text) && (
              <div className="glass card" data-reveal="slide-l" style={{ "--d": 150 }} data-tilt="">
                {c.branch_card_title && <h3>{c.branch_card_title}</h3>}
                {c.branch_card_text && <p className="small">{c.branch_card_text}</p>}
                <SiteLink className="btn btn--secondary" to="/branches">
                  Open Branch Finder
                </SiteLink>
              </div>
            )}
          </div>
          <form className="glass form-box" onSubmit={submit} noValidate data-reveal="slide-r">
            <div className="form">
              <fieldset className="fieldset">
                <legend className="fieldset__title">
                  <span className="icon-badge">
                    <Icon name="send" />
                  </span>{" "}
                  Send an inquiry
                </legend>
                <div className="field">
                  <label className="field__label" htmlFor="cname">
                    Full name
                  </label>
                  <input
                    className={`input${bad.name ? " is-invalid" : ""}`}
                    type="text"
                    id="cname"
                    value={f.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="cemail">
                    Email address
                  </label>
                  <input
                    className={`input${bad.email ? " is-invalid" : ""}`}
                    type="email"
                    id="cemail"
                    value={f.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="topic">
                    This message is about
                  </label>
                  <select className="select" id="topic" value={f.topic} onChange={(e) => set("topic", e.target.value)}>
                    <option>General inquiry</option>
                    <option>Branch inquiry</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="cmessage">
                    Message
                  </label>
                  <textarea
                    className={`textarea${bad.message ? " is-invalid" : ""}`}
                    id="cmessage"
                    value={f.message}
                    onChange={(e) => set("message", e.target.value)}
                    required
                  />
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
                <button className="btn btn--primary btn--lg" type="submit" disabled={busy}>
                  {busy ? "Sending…" : "Send message"} <Icon name="send" />
                </button>
                {c.form_note && <p className="muted">{c.form_note}</p>}
              </div>
              {status && (
                <p className={`form__status ${status.kind}`} role="status">
                  {status.text}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
