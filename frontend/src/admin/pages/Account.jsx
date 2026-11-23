import { useState } from "react";
import { api, errorMessage } from "../../lib/axios";
import { useToast } from "../ui";

export default function Account() {
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (f.next !== f.again) return toast.bad("The new passwords do not match.");
    setBusy(true);
    try {
      await api.put("/auth/password", { current_password: f.current, new_password: f.next });
      setF({ current: "", next: "", again: "" });
      toast.ok("Password updated.");
    } catch (err) {
      toast.bad(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <div>
          <h1>Password</h1>
          <p className="adm-muted">Use at least 8 characters.</p>
        </div>
      </div>
      <form className="adm-card adm-narrow" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="c">
            Current password
          </label>
          <input
            id="c"
            className="input"
            type="password"
            value={f.current}
            onChange={(e) => setF({ ...f, current: e.target.value })}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="n">
            New password
          </label>
          <input
            id="n"
            className="input"
            type="password"
            value={f.next}
            onChange={(e) => setF({ ...f, next: e.target.value })}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="a">
            New password again
          </label>
          <input
            id="a"
            className="input"
            type="password"
            value={f.again}
            onChange={(e) => setF({ ...f, again: e.target.value })}
            autoComplete="new-password"
            required
          />
        </div>
        <button className="btn btn--primary" disabled={busy}>
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
