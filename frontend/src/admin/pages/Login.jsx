import { useState } from "react";
import { Navigate } from "react-router";
import { ADMIN_PATH } from "../../lib/adminPath";
import { errorMessage } from "../../lib/axios";
import { useAuth } from "../auth";

export default function Login() {
  const { user, loading, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={ADMIN_PATH} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(errorMessage(err, "Could not sign in."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm adm-center">
      <form className="glass adm-login" onSubmit={submit}>
        <h1>Editor sign in</h1>
        <p className="adm-muted">Only administrators can edit the website.</p>
        <div className="field">
          <label className="field__label" htmlFor="u">
            Username
          </label>
          <input className="input" id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="p">
            Password
          </label>
          <input
            className="input"
            id="p"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="form__status bad" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
